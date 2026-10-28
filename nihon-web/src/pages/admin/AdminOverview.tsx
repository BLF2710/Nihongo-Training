import { Link } from 'react-router-dom';
import type { LessonEditStatus } from '../../api/lessonEdits';
import type { ReportQueue } from '../../api/moderation';
import { button, card, useAdminData } from './adminData';
import AdminAnalytics from './AdminAnalytics';
import { Chip, StatTile } from './AdminUi';

type Overview = { users: { total: number; active: number; admins: number }; database: string; databaseLatencyMs: number; uptimeSeconds: number; checkedAt: string; latestMigration: { name: string; applied_at: string } | null };
// A database answer slower than this is worth a look.
const SLOW_DATABASE_MS = 200;

const SHORTCUTS: [string, string, string, string][] = [
  ['/admin/users', '👥', 'Users & roles', 'Find accounts, change roles and status, unlock lessons, send reset links.'],
  ['/admin/content/availability', '📚', 'Content', 'Switch activities on or off, edit the question bank and lessons.'],
  ['/admin/audit-log', '📜', 'Audit log', 'See who changed what in the admin area.'],
  ['/admin/system/settings', '⚙️', 'System settings', 'Registration and the announcement banner.'],
];

const uptime = (seconds: number) => `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`;

function SystemStatus({ data }: { data: Overview }) {
  const isSlow = data.databaseLatencyMs > SLOW_DATABASE_MS;
  return <section className={card} aria-labelledby="status-heading">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="status-heading" className="text-xl font-bold">System status</h2><Chip tone="good" icon="●">All systems running</Chip></div>
    <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-gray-50 p-4"><dt className="text-sm text-gray-500">API</dt><dd className="mt-1 font-bold text-emerald-700">Online</dd></div>
      <div className="rounded-xl bg-gray-50 p-4"><dt className="text-sm text-gray-500">Database</dt><dd className={`mt-1 font-bold ${isSlow ? 'text-amber-800' : 'text-emerald-700'}`}>Connected · {data.databaseLatencyMs} ms{isSlow ? ' (slow)' : ''}</dd></div>
      <div className="rounded-xl bg-gray-50 p-4"><dt className="text-sm text-gray-500">API uptime</dt><dd className="mt-1 font-bold">{uptime(data.uptimeSeconds)}</dd></div>
      <div className="rounded-xl bg-gray-50 p-4"><dt className="text-sm text-gray-500">Last checked</dt><dd className="mt-1 font-bold">{new Date(data.checkedAt).toLocaleTimeString()}</dd></div>
      <div className="min-w-0 rounded-xl bg-gray-50 p-4 sm:col-span-2 lg:col-span-4"><dt className="text-sm text-gray-500">Latest database migration</dt><dd className="mt-1 break-words font-mono text-sm">{data.latestMigration?.name || 'No migrations recorded'}</dd></div>
    </dl>
  </section>;
}

/** What waits for an administrator: open reports, unanswered support requests and unpublished lesson drafts. */
function NeedsAttention() {
  const reports = useAdminData<ReportQueue>('/admin/reports');
  const support = useAdminData<{ unreadOpen: number; conversations: unknown[] }>('/admin/support?status=open');
  const edits = useAdminData<{ edits: LessonEditStatus[] }>('/admin/lessons/edits');
  const learners = reports.data?.learners ?? [];
  const repeated = learners.filter(item => item.isRepeated).length;
  const drafts = (edits.data?.edits ?? []).filter(edit => edit.hasDraft).length;
  return <section aria-labelledby="attention-heading" className="mb-6">
    <h2 id="attention-heading" className="mb-3 text-lg font-bold">Needs attention</h2>
    <div className="grid gap-4 md:grid-cols-3">
      <StatTile icon="🚩" label="Learners with open reports" value={reports.data ? learners.length : '…'} detail={repeated ? `${repeated} reported repeatedly` : 'Handled together per learner'} to="/admin/reports" tone={repeated ? 'danger' : 'neutral'} />
      <StatTile icon="🛟" label="Unread support requests" value={support.data ? (support.data.unreadOpen ?? 0) : '…'} detail={`${support.data?.conversations?.length ?? 0} open in total`} to="/admin/support" tone={support.data?.unreadOpen ? 'warning' : 'neutral'} />
      <StatTile icon="✏️" label="Unpublished lesson drafts" value={edits.data ? drafts : '…'} detail="Learners don't see drafts" to="/admin/content/lessons" />
    </div>
  </section>;
}

export default function AdminOverview() {
  const { data, error, loading, reload } = useAdminData<Overview>('/admin/overview');
  return <>
    <div className="mb-5 flex justify-end"><button className={button} disabled={loading} onClick={reload}>↻ Refresh</button></div>
    {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    {loading && !data && <p role="status" className="mb-4">Loading system overview…</p>}
    {data && <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile icon="👥" label="Total users" value={data.users.total} detail="Every account, any status" to="/admin/users" />
        <StatTile icon="✅" label="Active accounts" value={data.users.active} detail={`${data.users.total - data.users.active} suspended or closed`} />
        <StatTile icon="🛡️" label="Active admins" value={data.users.admins} detail="At least one must remain" />
      </div>
      <NeedsAttention />
      <SystemStatus data={data} />
      <section aria-labelledby="shortcuts-heading" className="mt-6">
        <h2 id="shortcuts-heading" className="mb-3 text-lg font-bold">Shortcuts</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{SHORTCUTS.map(([href, icon, title, description]) => <Link key={href} to={href} className={`${card} group transition hover:border-emerald-400 hover:shadow-md`}>
          <span aria-hidden="true" className="text-2xl">{icon}</span>
          <h3 className="mt-2 text-lg font-bold">{title} <span aria-hidden="true" className="inline-block transition group-hover:translate-x-1">→</span></h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        </Link>)}</div>
      </section>
    </>}
    <AdminAnalytics />
  </>;
}
