import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { button, useAdminData } from './adminData';
import { Chip, Notice } from './AdminUi';
import type { Tone } from './AdminUi';

type Integration = { configured: boolean; detail?: string };
type Status = {
  checkedAt: string;
  api: { environment: 'production' | 'development'; nodeVersion: string; uptimeSeconds: number };
  database: { latencyMs: number; sizeBytes: number; appliedMigrations: number; migrationFiles: number; latestMigration: { name: string; applied_at: string } | null };
  realtime: { sharedState: 'memory' | 'postgres'; connections: number; learners: number };
  integrations: { email: Integration; google: Integration; azureSpeech: Integration; anthropic: Integration };
};
type Check = { icon: string; title: string; tone: Tone; state: string; facts: [string, ReactNode][]; note?: string };

const AUTO_REFRESH_MS = 30_000;
// A database answer slower than this is worth a look.
const SLOW_DATABASE_MS = 200;

const uptime = (seconds: number) => seconds >= 86_400 ? `${Math.floor(seconds / 86_400)}d ${Math.floor(seconds % 86_400 / 3600)}h` : `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`;
const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** The status data turned into checks, each with a state an administrator can act on. */
function checksFor(status: Status): Check[] {
  const { api, database, realtime, integrations } = status;
  const isProduction = api.environment === 'production';
  const pending = database.migrationFiles - database.appliedMigrations;
  const slow = database.latencyMs > SLOW_DATABASE_MS;
  const optional = (configured: boolean, what: string): Pick<Check, 'tone' | 'state' | 'note'> => configured
    ? { tone: 'good', state: 'Configured' } : { tone: 'neutral', state: 'Not set up', note: what };
  return [
    { icon: '🖥️', title: 'API', tone: 'good', state: 'Online', facts: [['Environment', api.environment], ['Uptime', uptime(api.uptimeSeconds)], ['Node.js', api.nodeVersion]] },
    { icon: '🗄️', title: 'Database', tone: slow ? 'warning' : 'good', state: slow ? 'Slow' : 'Connected', facts: [['Response time', `${database.latencyMs} ms`], ['Size', megabytes(database.sizeBytes)]], note: slow ? 'Answers are slower than usual. Check the database server.' : undefined },
    {
      icon: '🧱', title: 'Migrations', tone: database.migrationFiles === 0 ? 'neutral' : pending > 0 ? 'warning' : 'good',
      state: database.migrationFiles === 0 ? "Can't check" : pending > 0 ? `${pending} not applied` : 'Up to date',
      facts: [['Applied', String(database.appliedMigrations)], ['Latest', <span key="latest" className="break-all font-mono text-xs">{database.latestMigration?.name ?? 'None'}</span>]],
      note: pending > 0 ? 'Run npm run migrate in nihon-api.' : undefined,
    },
    {
      icon: '📡', title: 'Live updates', tone: isProduction && realtime.sharedState === 'memory' ? 'warning' : 'good', state: 'Running',
      facts: [['Shared state', realtime.sharedState === 'postgres' ? 'PostgreSQL' : 'This process only'], ['Open connections', `${realtime.connections} (${realtime.learners} ${realtime.learners === 1 ? 'account' : 'accounts'})`]],
      note: isProduction && realtime.sharedState === 'memory' ? 'With several API processes, set SHARED_STATE=postgres.' : undefined,
    },
    {
      icon: '✉️', title: 'Email', facts: [['Delivery', integrations.email.detail ?? '']],
      ...(integrations.email.configured ? { tone: 'good' as const, state: 'Sending' } : { tone: isProduction ? 'danger' as const : 'warning' as const, state: 'Not sending', note: 'Password reset and confirmation emails are only printed to the API console. Set SMTP_URL and MAIL_FROM.' }),
    },
    { icon: '🔑', title: 'Google sign-in', facts: [['Used for', 'Continue with Google']], ...optional(integrations.google.configured, 'Set GOOGLE_CLIENT_ID to offer it.') },
    { icon: '🎙️', title: 'Azure Speech', facts: [['Used for', 'Pronunciation and fluency scores']], ...optional(integrations.azureSpeech.configured, 'Speaking tests are scored on content only. Set AZURE_SPEECH_KEY and AZURE_SPEECH_ENDPOINT.') },
    { icon: '🤖', title: 'Anthropic (Claude)', facts: [['Used for', 'Study assistant, content grading']], ...optional(integrations.anthropic.configured, 'The assistant uses its basic fallback. Set ANTHROPIC_API_KEY.') },
  ];
}

function CheckCard({ check }: { check: Check }) {
  const border = check.tone === 'danger' ? 'border-red-300' : check.tone === 'warning' ? 'border-amber-300' : 'border-gray-200';
  return <article className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${border}`} aria-label={check.title}>
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3"><span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-xl">{check.icon}</span><h3 className="font-bold">{check.title}</h3></div>
      <Chip tone={check.tone} icon={check.tone === 'good' ? '●' : check.tone === 'neutral' ? '○' : '⚠'}>{check.state}</Chip>
    </div>
    <dl className="mt-4 space-y-1.5 text-sm">{check.facts.map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt className="text-gray-500">{label}</dt><dd className="min-w-0 text-right font-semibold text-gray-900">{value}</dd></div>)}</dl>
    {check.note && <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">{check.note}</p>}
  </article>;
}

/** Live status of the API, database, live updates and outside services, refreshed every 30 seconds. */
export default function AdminSystemStatus() {
  const { data, error, loading, reload } = useAdminData<Status>('/admin/status');
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') reload(); }, AUTO_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [auto, reload]);
  const checks = data ? checksFor(data) : [];
  const problems = checks.filter(check => check.tone === 'danger' || check.tone === 'warning');
  return <>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={auto} onChange={event => setAuto(event.target.checked)} />Refresh every 30 seconds</label>
      <div className="flex items-center gap-3">{data && <span className="text-xs text-gray-500">Checked {new Date(data.checkedAt).toLocaleTimeString()}</span>}<button className={button} disabled={loading} onClick={reload}>↻ Refresh</button></div>
    </div>
    {error && <Notice tone="danger">{error}</Notice>}
    {loading && !data && <p role="status">Checking…</p>}
    {data && <>
      <div role="status" className={`mb-6 flex items-center gap-4 rounded-2xl border p-5 ${problems.length ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
        <span aria-hidden="true" className="text-3xl">{problems.length ? '⚠️' : '✅'}</span>
        <div><p className="text-lg font-black text-gray-900">{problems.length ? `${problems.length} ${problems.length === 1 ? 'thing needs' : 'things need'} attention` : 'All systems running'}</p>
          <p className="text-sm text-gray-700">{problems.length ? problems.map(check => `${check.title}: ${check.state.toLowerCase()}`).join(' · ') : 'The API and database answer normally; optional services are listed below.'}</p></div>
      </div>
      <h2 className="mb-3 text-lg font-bold">Core</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2">{checks.slice(0, 4).map(check => <CheckCard key={check.title} check={check} />)}</div>
      <h2 className="mb-3 text-lg font-bold">Outside services</h2>
      <div className="grid gap-4 md:grid-cols-2">{checks.slice(4).map(check => <CheckCard key={check.title} check={check} />)}</div>
      <p className="mt-4 text-xs text-gray-500">Only whether a service is set up is shown here, never its keys.</p>
    </>}
  </>;
}
