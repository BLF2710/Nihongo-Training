import { useAdminData, card } from './adminData';
import type { ReportQueue } from '../../api/moderation';
import ReportPanel from './ReportPanel';

/** Learners with open reports, those reported by several different learners first. */
export default function AdminReports() {
  const queue = useAdminData<ReportQueue>('/admin/reports');
  return <section className={card} aria-labelledby="reports-heading">
    <h2 id="reports-heading" className="text-xl font-black">Reports</h2>
    {queue.data && <p className="text-sm text-gray-600">Reports about the same learner are handled together. A learner reported by {queue.data.repeatReporters} or more different learners within {queue.data.windowDays} days is marked as reported repeatedly. A second report by the same learner is added to their first request.</p>}
    {queue.error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{queue.error}</p>}
    {!queue.data && !queue.error && <p role="status" className="mt-4">Loading…</p>}
    {queue.data && (queue.data.learners.length === 0 ? <p className="mt-4 text-gray-600">No open reports.</p>
      : <div className="mt-4 grid gap-3">{queue.data.learners.map(summary => <ReportPanel key={summary.learner.id} summary={summary} onResolved={queue.reload} />)}</div>)}
  </section>;
}
