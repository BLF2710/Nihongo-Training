import { useState } from 'react';
import type { FormEvent } from 'react';
import { sendPasswordReset, setLessonAccess, updateUser } from '../../api/admin';
import { adminError, button, card, dangerButton, input, primaryButton, useAdminData } from './adminData';
import { Chip, EmptyState, NameBadge, Notice } from './AdminUi';

type User = { id: number; username: string; email: string; role: 'learner' | 'admin'; status: 'active' | 'suspended'; all_lessons_unlocked: boolean; created_at: string; last_login_at: string | null };
type Results = { users: User[]; total: number; page: number; pageSize: number };
type Panel = { kind: 'edit'; user: User } | { kind: 'reset'; user: User } | null;

const STATUS: Record<string, { tone: 'good' | 'danger' | 'neutral'; icon: string; label: string }> = {
  active: { tone: 'good', icon: '●', label: 'Active' }, suspended: { tone: 'danger', icon: '⏸', label: 'Suspended' }, inactive: { tone: 'neutral', icon: '○', label: 'Closed' },
};
const lastSeen = (iso: string | null) => iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never';

function RolePermissions() {
  return <details className={`${card} mb-5`}>
    <summary className="cursor-pointer"><h2 className="inline text-lg font-bold">Role permissions</h2> <span className="text-sm text-gray-500">— who can do what</span></summary>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl bg-gray-50 p-4"><Chip icon="🎓">Learner</Chip><p className="mt-2 text-sm text-gray-600">Learning tools, friends and their own progress.</p></div>
      <div className="rounded-xl bg-gray-50 p-4"><Chip tone="info" icon="🛡️">Admin</Chip><p className="mt-2 text-sm text-gray-600">Everything in this admin area: users, content, moderation and system settings.</p></div>
    </div>
    <p className="mt-4 text-sm text-gray-500">Access is checked on the server. You can't suspend or demote your own account, and at least one active administrator must remain.</p>
  </details>;
}

/** Edit one account's username, email, role and status. */
function EditPanel({ user, isSelf, busy, onChange, onSave, onCancel }: { user: User; isSelf: boolean; busy: boolean; onChange: (user: User) => void; onSave: () => void; onCancel: () => void }) {
  const submit = (event: FormEvent) => { event.preventDefault(); onSave(); };
  return <form onSubmit={submit} className={`${card} mb-6 border-emerald-200`} aria-label={`Edit ${user.username}`}>
    <div className="flex items-center gap-3"><NameBadge name={user.username} /><h2 className="text-xl font-bold">Edit {user.username}</h2></div>
    <fieldset disabled={busy} className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-bold">Username<input required pattern="[A-Za-z0-9_]{3,30}" className={input} value={user.username} onChange={event => onChange({ ...user, username: event.target.value })} /></label>
      <label className="text-sm font-bold">Email<input required type="email" maxLength={254} className={input} value={user.email} onChange={event => onChange({ ...user, email: event.target.value })} /></label>
      <label className="text-sm font-bold">Role<select disabled={isSelf} className={input} value={user.role} onChange={event => onChange({ ...user, role: event.target.value as User['role'] })}><option value="learner">Learner</option><option value="admin">Admin</option></select></label>
      <label className="text-sm font-bold">Account status<select disabled={isSelf} className={input} value={user.status} onChange={event => onChange({ ...user, status: event.target.value as User['status'] })}><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
      <p className="text-sm text-gray-500 sm:col-span-2">Suspending keeps the learner's progress and signs them out. Give the admin role only to people you trust.</p>
      <div className="flex gap-3 sm:col-span-2"><button className={primaryButton}>{busy ? 'Saving…' : 'Save changes'}</button><button type="button" className={button} onClick={onCancel}>Cancel</button></div>
    </fieldset>
  </form>;
}

/** Send a password-reset link to the account's email address; optionally sign it out everywhere first. */
function ResetPanel({ user, busy, onSend, onCancel }: { user: User; busy: boolean; onSend: (signOut: boolean) => void; onCancel: () => void }) {
  const [signOut, setSignOut] = useState(false);
  return <section className={`${card} mb-6 border-amber-200`} aria-label={`Reset password for ${user.username}`}>
    <div className="flex items-center gap-3"><NameBadge name={user.username} /><h2 className="text-xl font-bold">Reset password for {user.username}</h2></div>
    <p className="mt-3 text-sm text-gray-600">We'll email <b>{user.email}</b> a link to choose a new password (valid for 1 hour). You never see or set the password yourself.</p>
    <label className="mt-4 flex gap-3 rounded-xl bg-amber-50 p-3 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-red-700" checked={signOut} disabled={busy} onChange={event => setSignOut(event.target.checked)} />
      <span><b>Also sign them out on every device</b><span className="block text-gray-600">Use this if the account may have been taken over.</span></span></label>
    <div className="mt-4 flex gap-3"><button className={signOut ? dangerButton : primaryButton} disabled={busy} onClick={() => onSend(signOut)}>{busy ? 'Sending…' : signOut ? 'Sign out and send link' : 'Send reset link'}</button><button className={button} disabled={busy} onClick={onCancel}>Cancel</button></div>
  </section>;
}

// Accounts, roles, lesson access and password resets, all on this one page.
export default function AdminUsers({ currentId }: { currentId: number }) {
  // The support inbox and reports link here with ?search=<username>.
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get('search') ?? '');
  const [query, setQuery] = useState(search);
  const [page, setPage] = useState(1);
  const result = useAdminData<Results>(`/admin/users?search=${encodeURIComponent(query)}&page=${page}`);
  const [panel, setPanel] = useState<Panel>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const run = async (work: () => Promise<string>) => {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try { setMessage(await work()); setPanel(null); result.reload(); }
    catch (failure) { setError(adminError(failure)); }
    finally { setBusy(false); }
  };
  const save = (user: User) => run(async () => { await updateUser(user.id, { username: user.username, email: user.email, role: user.role, status: user.status }); return 'User updated. Role and status changes apply to their next request.'; });
  const toggleLessons = (user: User) => run(async () => { await setLessonAccess(user.id, !user.all_lessons_unlocked); return user.all_lessons_unlocked ? `Normal lesson progression restored for ${user.username}.` : `All lessons unlocked for ${user.username}. Their progress and XP are unchanged.`; });
  const reset = (user: User, signOut: boolean) => run(async () => { const sent = await sendPasswordReset(user.id, signOut); return `Reset link sent to ${sent.sentTo}.${sent.signedOut ? ' They were signed out on every device.' : ''}`; });
  const open = (next: Panel) => { setPanel(next); setMessage(''); setError(''); };
  const users = result.data?.users ?? [];

  return <>
    <RolePermissions />
    <form className="mb-5 flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); setQuery(search.trim()); setPage(1); }}>
      <label className="min-w-0 flex-1 text-sm font-bold">Search users<input className={input} value={search} onChange={event => setSearch(event.target.value)} placeholder="Username or email" maxLength={100} /></label>
      <button className={primaryButton} disabled={result.loading}>Search</button>
      <button type="button" className={button} disabled={result.loading} onClick={result.reload}>↻ Refresh</button>
    </form>
    {(error || result.error) && <Notice tone="danger">{error || result.error}</Notice>}
    {message && <Notice tone="good">{message}</Notice>}
    {panel?.kind === 'edit' && <EditPanel user={panel.user} isSelf={panel.user.id === currentId} busy={busy} onChange={user => setPanel({ kind: 'edit', user })} onSave={() => void save(panel.user)} onCancel={() => open(null)} />}
    {panel?.kind === 'reset' && <ResetPanel user={panel.user} busy={busy} onSend={signOut => void reset(panel.user, signOut)} onCancel={() => open(null)} />}
    {result.loading && !result.data && <p role="status" className="mb-4">Loading users…</p>}
    {result.data && users.length === 0 ? <EmptyState icon="🔎" title="No users match your search">Try part of a username or email address.</EmptyState> :
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm"><table className="w-full text-left text-sm"><caption className="sr-only">User accounts</caption>
      <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500"><tr>{['User', 'Role', 'Status', 'Lessons', 'Last login', 'Actions'].map(label => <th key={label} className="px-5 py-3 font-bold">{label}</th>)}</tr></thead>
      <tbody>{users.map(user => { const status = STATUS[user.status] ?? STATUS.inactive; return <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50/60">
        <td className="px-5 py-3"><div className="flex items-center gap-3"><NameBadge name={user.username} /><div className="min-w-0"><p className="font-bold">{user.username}{user.id === currentId ? ' (you)' : ''}</p><p className="truncate text-gray-500">{user.email}</p></div></div></td>
        <td className="px-5 py-3">{user.role === 'admin' ? <Chip tone="info" icon="🛡️">Admin</Chip> : <Chip icon="🎓">Learner</Chip>}</td>
        <td className="px-5 py-3"><Chip tone={status.tone} icon={status.icon}>{status.label}</Chip></td>
        <td className="px-5 py-3">{user.all_lessons_unlocked ? <Chip tone="info">All unlocked</Chip> : <Chip>Normal</Chip>}</td>
        <td className="whitespace-nowrap px-5 py-3 text-gray-600">{lastSeen(user.last_login_at)}</td>
        <td className="px-5 py-3"><div className="flex flex-wrap gap-2">
          <button disabled={busy || result.loading} className={button} aria-label={`Edit ${user.username}`} onClick={() => open({ kind: 'edit', user: { ...user } })}>Edit</button>
          <button disabled={busy || result.loading || user.status !== 'active'} className={button + ' whitespace-nowrap'} aria-label={`Reset password for ${user.username}`} onClick={() => open({ kind: 'reset', user })}>Reset password</button>
          <button disabled={busy || result.loading} className={button + ' whitespace-nowrap'} aria-label={`${user.all_lessons_unlocked ? 'Restore normal lessons for' : 'Unlock all lessons for'} ${user.username}`} onClick={() => void toggleLessons(user)}>{user.all_lessons_unlocked ? 'Relock lessons' : 'Unlock all lessons'}</button>
        </div></td>
      </tr>; })}</tbody>
    </table></div>}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-gray-500">{result.data?.total ?? 0} users · Page {page}</p>
      <div className="flex gap-3"><button className={button} disabled={page === 1 || result.loading || busy} onClick={() => setPage(page - 1)}>← Previous</button><button className={button} disabled={!result.data || page * result.data.pageSize >= result.data.total || result.loading || busy} onClick={() => setPage(page + 1)}>Next →</button></div></div>
  </>;
}
