import { Link, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { clearSession, saveUserRole } from '../../lib/authStorage';
import { button, useAdminData } from './adminData';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminContentPage from './AdminContentPage';
import AdminSettings from './AdminSettings';
import AdminSystemStatus from './AdminSystemStatus';
import AdminSupport from './AdminSupport';
import AdminReports from './AdminReports';
import AdminAuditLog from './AdminAuditLog';
import { ThemeButton } from '../../components/ThemeToggle';

type Account = { id: number; username: string; role: string };
type Page = { path: string; title: string; icon: string; description: string; render: (account: Account) => ReactNode; matches?: (path: string) => boolean };
type Counts = { reports: number; support: number };

const PAGES: Page[] = [
  { path: '/admin', title: 'Overview', icon: '🏠', description: 'What needs attention, how learners are doing, and the system at a glance.', render: () => <AdminOverview /> },
  { path: '/admin/users', title: 'Users & roles', icon: '👥', description: 'Find accounts, change roles and status, unlock lessons and send password-reset links.', render: account => <AdminUsers currentId={account.id} /> },
  { path: '/admin/reports', title: 'Reports', icon: '🚩', description: 'Reports about learners, grouped per learner: dismiss, warn or suspend.', render: () => <AdminReports /> },
  { path: '/admin/support', title: 'Support inbox', icon: '🛟', description: 'Questions from learners, answered as Lingora support.', render: () => <AdminSupport /> },
  { path: '/admin/content', title: 'Content', icon: '📚', description: 'What learners can open, the review question bank, and lesson edits.', render: () => <AdminContentPage />, matches: path => path.startsWith('/admin/content/') },
  { path: '/admin/audit-log', title: 'Audit log', icon: '📜', description: 'Every change made in the admin area, newest first.', render: () => <AdminAuditLog /> },
  { path: '/admin/system/status', title: 'System status', icon: '🩺', description: 'The API, database, live updates and outside services, checked live.', render: () => <AdminSystemStatus /> },
  { path: '/admin/system/settings', title: 'System settings', icon: '⚙️', description: 'Registration and the announcement banner.', render: () => <AdminSettings /> },
];
const GROUPS: { label: string | null; paths: string[] }[] = [
  { label: null, paths: ['/admin'] },
  { label: 'People', paths: ['/admin/users', '/admin/reports', '/admin/support'] },
  { label: 'Content', paths: ['/admin/content'] },
  { label: 'System', paths: ['/admin/audit-log', '/admin/system/status', '/admin/system/settings'] },
];
// Old addresses: the question bank and lesson editor now live on the Content page.
const REDIRECTS: [string, string][] = [
  ['/admin/system/roles', '/admin/users'], ['/admin/content', '/admin/content/availability'], ['/admin/questions', '/admin/content/questions'],
  ['/admin/questions/new', '/admin/content/questions/new'], ['/admin/lessons', '/admin/content/lessons'],
];

const pageFor = (path: string) => PAGES.find(page => page.path === path || page.matches?.(path));

/** Red counts beside Reports and Support inbox, refreshed when the admin moves between pages. */
function useAttentionCounts(path: string): Counts {
  const reports = useAdminData<{ learners: unknown[] }>('/admin/reports');
  const support = useAdminData<{ unreadOpen: number }>('/admin/support?status=open');
  const reloadReports = reports.reload, reloadSupport = support.reload;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on navigation only
  useEffect(() => { reloadReports(); reloadSupport(); }, [path]);
  // Counts are a convenience: anything unexpected reads as nothing waiting.
  return { reports: reports.data?.learners?.length ?? 0, support: support.data?.unreadOpen ?? 0 };
}

export default function AdminPage() {
  const access = useAdminData<Account>('/admin/access');
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const role = access.data?.role;
  // Keeps the stored role in step with the server, so a demoted account is no longer sent here.
  useEffect(() => { if (role) saveUserRole(role); }, [role]);
  const logout = () => { clearSession(); navigate('/login'); };
  if (access.loading && !access.data) return <main className="mx-auto max-w-lg p-8"><p role="status">Checking administrator access…</p></main>;
  if (access.error || access.data?.role !== 'admin') return <main className="mx-auto max-w-lg p-8"><h1 className="text-2xl font-black">Administrator access required</h1><p role="alert" className="my-5">{access.error || 'This account does not have permission to use the admin area.'}</p><button className={button} onClick={access.reload}>Retry</button> {access.data ? <Link className={button} to="/">Return to learning</Link> : <button className={button} onClick={logout}>Log out</button>}</main>;
  const redirect = REDIRECTS.find(([from]) => from === location.pathname);
  if (redirect) return <Navigate to={redirect[1] + location.search} replace />;
  return <AdminShell account={access.data} open={open} setOpen={setOpen} onLogout={logout} />;
}

function AdminShell({ account, open, setOpen, onLogout }: { account: Account; open: boolean; setOpen: (open: boolean) => void; onLogout: () => void }) {
  const location = useLocation();
  const counts = useAttentionCounts(location.pathname);
  const page = pageFor(location.pathname);
  const badge = (path: string) => path === '/admin/reports' ? counts.reports : path === '/admin/support' ? counts.support : 0;
  return <div className="min-h-screen bg-gray-50 text-gray-900">
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button className={button + ' lg:hidden'} aria-label="Toggle admin navigation" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
        <Link to="/admin" className="flex items-center gap-2 text-xl font-black">
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-600 to-emerald-500 text-base text-white">🌐</span>
          <span>Ling<span className="text-emerald-600">ora</span></span>
          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">Admin</span>
        </Link>
      </div>
      <div className="flex items-center gap-2"><ThemeButton /><button className={button} onClick={onLogout}>Log out</button></div>
    </header>
    {open && <button className="fixed inset-0 top-18 z-30 bg-black/30 lg:hidden" aria-label="Close admin navigation" onClick={() => setOpen(false)} />}
    <aside aria-label="Admin sidebar" className={`fixed bottom-0 left-0 top-18 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto p-4">{GROUPS.map(group => <div key={group.label ?? 'home'} className="mb-4">
        {group.label && <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">{group.label}</p>}
        <ul className="space-y-1">{group.paths.map(path => { const item = pageFor(path)!; const count = badge(path); return <li key={path}>
          <NavLink end={path === '/admin'} to={path} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <span aria-hidden="true" className="w-5 text-center">{item.icon}</span><span className="flex-1">{item.title}</span>
            {count > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white" aria-label={`${count} need attention`}>{count}</span>}
          </NavLink>
        </li>; })}</ul>
      </div>)}</nav>
      <div className="flex items-center gap-3 border-t border-gray-100 p-4">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-black text-white">{account.username[0]?.toUpperCase()}</span>
        <span className="min-w-0"><span className="block truncate text-sm font-bold">{account.username}</span><span className="block text-xs text-gray-500">Signed in as administrator</span></span>
      </div>
    </aside>
    <main className="min-w-0 px-4 py-8 sm:px-8 lg:ml-64"><div className="mx-auto max-w-6xl">
      <div className="mb-7 flex items-start gap-4">
        <span aria-hidden="true" className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-gray-200 sm:flex">{page?.icon ?? '❔'}</span>
        <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Administration</p>
          <h1 className="mt-1 text-3xl font-black">{page?.title ?? 'Page not found'}</h1>
          {page && <p className="mt-1 text-gray-600">{page.description}</p>}</div>
      </div>
      <div key={page?.path ?? location.pathname}>{page ? page.render(account) : <Link to="/admin" className={button}>Go to overview</Link>}</div>
    </div></main>
  </div>;
}
