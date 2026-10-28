import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { saveSettings } from '../../api/admin';
import type { AnnouncementAudience, Settings } from '../../api/admin';
import { adminError, button, primaryButton, useAdminData } from './adminData';
import { Chip, Notice } from './AdminUi';

const MAX_ANNOUNCEMENT = 500;
const AUDIENCES: [AnnouncementAudience, string, string, string][] = [
  ['everyone', '🌍', 'Everyone', 'Every visitor, including sign-in, registration and guest pages. Good for maintenance or registration notices.'],
  ['learners', '🎓', 'Signed-in learners only', 'Only after signing in. Guests never receive the text.'],
];
type Editable = Pick<Settings, 'registration_enabled' | 'announcement' | 'announcement_audience'>;
const editable = (settings: Settings): Editable => ({ registration_enabled: settings.registration_enabled, announcement: settings.announcement, announcement_audience: settings.announcement_audience ?? 'everyone' });

export default function AdminSettings() {
  const result = useAdminData<Settings>('/admin/settings');
  return <>
    {result.error && <Notice tone="danger">{result.error} <button className={button} onClick={result.reload}>Retry</button></Notice>}
    {result.loading && !result.data && <p role="status">Loading settings…</p>}
    {result.data && <SettingsForm initial={result.data} />}
  </>;
}

/** One setting group: what it does on the left, the controls on the right (stacked on small screens). */
function Row({ id, icon, title, description, badge, children }: { id: string; icon: string; title: string; description: string; badge?: ReactNode; children: ReactNode }) {
  return <section aria-labelledby={id} className="grid gap-4 border-t border-gray-200 py-6 first:border-t-0 first:pt-0 md:grid-cols-[16rem_1fr] md:gap-8">
    <div><h2 id={id} className="flex items-center gap-2 text-lg font-bold"><span aria-hidden="true">{icon}</span>{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>{badge && <div className="mt-2">{badge}</div>}</div>
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">{children}</div>
  </section>;
}

function SettingsForm({ initial }: { initial: Settings }) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState<Editable>(() => editable(initial));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isDirty = JSON.stringify(draft) !== JSON.stringify(editable(saved));
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);
  const change = (next: Partial<Editable>) => { setDraft({ ...draft, ...next }); setMessage(''); };
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage(''); setError('');
    try { const result = await saveSettings(draft); setSaved(result); setDraft(editable(result)); setMessage('Settings saved. Learners get them on their next page.'); }
    catch (failure) { setError(adminError(failure)); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="max-w-5xl"><fieldset disabled={busy}>
    <legend className="sr-only">Platform settings</legend>
    <Row id="registration-heading" icon="🧾" title="Registration" description="Whether new people can create an account. Existing accounts can always sign in."
      badge={draft.registration_enabled ? <Chip tone="good" icon="●">Open</Chip> : <Chip tone="warning" icon="⏸">Closed</Chip>}>
      <label className="flex cursor-pointer items-start gap-4">
        {/* The real checkbox lies invisibly over the drawn switch, so clicks, keys and screen readers all reach it. */}
        <span className="relative mt-0.5 h-6 w-11 shrink-0">
          <input type="checkbox" role="switch" className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" checked={draft.registration_enabled} onChange={event => change({ registration_enabled: event.target.checked })} />
          <span aria-hidden="true" className="absolute inset-0 rounded-full bg-gray-300 transition peer-checked:bg-emerald-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-600 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
        </span>
        <span><strong>Allow new registrations</strong><span className="mt-1 block text-sm text-gray-500">When off, the registration page says sign-ups are closed (Google sign-in too).</span></span>
      </label>
    </Row>
    <Row id="announcement-heading" icon="📢" title="Announcement" description="A short message shown in a banner at the top of the site. Never shown in the admin area."
      badge={draft.announcement.trim() ? <Chip tone="info" icon="●">Showing</Chip> : <Chip icon="○">Off</Chip>}>
      <label className="block text-sm font-bold">Announcement<textarea rows={3} maxLength={MAX_ANNOUNCEMENT} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 font-normal text-gray-900 focus-visible:outline-2 focus-visible:outline-emerald-600" value={draft.announcement} placeholder="e.g. Maintenance tonight at 22:00 — the site may be unavailable for 10 minutes." onChange={event => change({ announcement: event.target.value })} />
        <span className="mt-1 flex justify-between text-xs font-normal text-gray-500"><span>Leave blank to remove the banner.</span><span className={draft.announcement.length > MAX_ANNOUNCEMENT - 50 ? 'font-bold text-amber-800' : ''}>{draft.announcement.length}/{MAX_ANNOUNCEMENT}</span></span></label>
      <fieldset className="mt-5"><legend className="text-sm font-bold">Who sees the announcement</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">{AUDIENCES.map(([value, icon, label, help]) => <label key={value} className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${draft.announcement_audience === value ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-gray-200 hover:border-gray-300'}`}>
          <input type="radio" name="announcement-audience" value={value} checked={draft.announcement_audience === value} onChange={() => change({ announcement_audience: value })} className="mt-1 accent-emerald-700" />
          <span><span className="block text-sm font-semibold"><span aria-hidden="true">{icon} </span>{label}</span><span className="block text-xs text-gray-600">{help}</span></span></label>)}</div></fieldset>
      <div className="mt-5"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Preview</p>
        <div className="mt-1 overflow-hidden rounded-xl border border-gray-200">
          <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-gray-200 bg-gray-50 px-3 py-1.5"><span className="h-2 w-2 rounded-full bg-gray-300" /><span className="h-2 w-2 rounded-full bg-gray-300" /><span className="h-2 w-2 rounded-full bg-gray-300" /></div>
          {draft.announcement.trim()
            // Looks like the site banner (SiteGate); not a live region, so the admin area itself never announces it.
            ? <p aria-hidden="true" className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900">📣 {draft.announcement}</p>
            : <p className="px-4 py-3 text-center text-sm text-gray-500">No banner is shown.</p>}
          <div aria-hidden="true" className="space-y-2 p-4"><div className="h-2 w-2/3 rounded bg-gray-100" /><div className="h-2 w-1/2 rounded bg-gray-100" /></div>
        </div></div>
    </Row>
    {error && <Notice tone="danger">{error}</Notice>}
    <div className={`sticky bottom-4 z-10 mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 shadow-lg transition ${isDirty ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}>
      <p role="status" className="text-sm text-gray-700">{isDirty ? <><span aria-hidden="true">● </span><b>Unsaved changes</b></> : message ? <span className="font-semibold text-emerald-800"><span aria-hidden="true">✓ </span>{message}</span> : <>All changes saved · last updated {new Date(saved.updated_at).toLocaleString()}</>}</p>
      <div className="flex gap-2">{isDirty && <button type="button" className={button} onClick={() => { setDraft(editable(saved)); setMessage(''); }}>Discard</button>}<button className={primaryButton} disabled={!isDirty}>{busy ? 'Saving…' : 'Save settings'}</button></div>
    </div>
  </fieldset></form>;
}
