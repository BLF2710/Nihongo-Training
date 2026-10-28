import { useAdminData, button } from './adminData';
import type { ReportQueue } from '../../api/moderation';
import { EmptyState, Notice, StatTile } from './AdminUi';
import ReportPanel from './ReportPanel';

/** Learners with open reports, those reported by several different learners first. */
export default function AdminReports() {
  const queue = useAdminData<ReportQueue>('/admin/reports');
  const learners = queue.data?.learners ?? [];
  const repeated = learners.filter(item => item.isRepeated).length;
  const openReports = learners.reduce((sum, item) => sum + item.openReports, 0);
  return <>
    {queue.data && <div className="mb-5 grid gap-4 sm:grid-cols-3">
      <StatTile icon="👤" label="Learners reported" value={learners.length} detail="Reports are handled per learner" />
      <StatTile icon="⚠️" label="Reported repeatedly" value={repeated} detail={`${queue.data.repeatReporters}+ learners within ${queue.data.windowDays} days`} tone={repeated ? 'danger' : 'neutral'} />
      <StatTile icon="🚩" label="Open reports" value={openReports} detail="A repeat by the same learner joins their first request" />
    </div>}
    <div className="mb-4 flex justify-end"><button className={button} disabled={queue.loading} onClick={queue.reload}>↻ Refresh</button></div>
    {queue.error && <Notice tone="danger">{queue.error}</Notice>}
    {!queue.data && !queue.error && <p role="status">Loading…</p>}
    {queue.data && (learners.length === 0
      ? <EmptyState icon="🎉" title="No open reports.">When a learner reports someone, it appears here and in the support inbox.</EmptyState>
      : <div className="grid gap-4">{learners.map(summary => <ReportPanel key={summary.learner.id} summary={summary} onResolved={queue.reload} />)}</div>)}
  </>;
}
