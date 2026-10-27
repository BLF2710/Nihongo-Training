import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveReports } from '../../api/moderation';
import type { ReportResolution, ReportSummary } from '../../api/moderation';
import { adminError, button, input } from './adminData';

const MAX_WARNING_LENGTH = 1000;
const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/**
 * All open reports about one learner, handled together: dismiss, warn (the learner gets the message as a support
 * request) or suspend. Every reporter is answered and their request closed.
 */
export default function ReportPanel({ summary, onResolved }: { summary: ReportSummary; onResolved: () => void }) {
  const [mode, setMode] = useState<'idle' | 'warned' | 'suspended'>('idle');
  const [warning, setWarning] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { learner } = summary;
  const resolve = async (resolution: ReportResolution) => {
    setBusy(true); setError('');
    try { await resolveReports(learner.id, resolution, resolution === 'warned' ? warning.trim() : undefined); onResolved(); }
    catch (failure) { setError(adminError(failure)); setBusy(false); }
  };
  return <section aria-label={`Reports about ${learner.username}`} className={`rounded-2xl border p-4 ${summary.isRepeated ? 'border-red-300 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <p className="font-black">{summary.isRepeated && <span className="mr-2 rounded-full bg-red-700 px-2 py-0.5 text-xs text-white">Reported repeatedly</span>}{learner.displayName} <span className="font-normal text-gray-600">@{learner.username}</span>{learner.status !== 'active' && <span className="ml-2 text-sm text-gray-600">({learner.status})</span>}</p>
        <p className="text-sm text-gray-700">{plural(summary.openReports, 'open report')} from {plural(summary.reporters, 'learner')} ({summary.kinds.join(' and ')}), {day(summary.firstAt)}–{day(summary.lastAt)}{summary.earlierResolved > 0 && ` · ${summary.earlierResolved} resolved before`}</p>
        <p className="mt-1 flex flex-wrap gap-x-3 text-sm">{summary.ticketIds.map(id => <Link key={id} className="font-semibold text-emerald-700 hover:underline" to={`/admin/support?status=all&id=${id}`}>Request #{id}</Link>)}
          <Link className="font-semibold text-emerald-700 hover:underline" to={`/admin/users?search=${encodeURIComponent(learner.username)}`}>Account</Link></p>
      </div>
      {mode === 'idle' && <div className="flex flex-wrap gap-2">
        <button className={button} disabled={busy} onClick={() => void resolve('dismissed')} aria-label={`Dismiss reports about ${learner.username}`}>Dismiss</button>
        <button className={button} disabled={busy} onClick={() => setMode('warned')} aria-label={`Warn ${learner.username}`}>Warn</button>
        {learner.status === 'active' && <button className={button + ' text-red-700'} disabled={busy} onClick={() => setMode('suspended')} aria-label={`Suspend ${learner.username}`}>Suspend</button>}
      </div>}
    </div>
    {mode === 'warned' && <div className="mt-3">
      <label className="text-sm font-semibold">Warning sent to @{learner.username} as a support message<textarea className={input} rows={3} maxLength={MAX_WARNING_LENGTH} value={warning} onChange={event => setWarning(event.target.value)} /></label>
      <div className="mt-2 flex gap-2"><button className={button} disabled={busy || !warning.trim()} onClick={() => void resolve('warned')}>Send warning and close reports</button><button className={button} disabled={busy} onClick={() => setMode('idle')}>Cancel</button></div>
    </div>}
    {mode === 'suspended' && <div className="mt-3" role="group" aria-label="Confirm suspension">
      <p className="text-sm">Suspend @{learner.username}? They're signed out and can't sign in until an administrator reactivates the account in Users & roles.</p>
      <div className="mt-2 flex gap-2"><button className={button + ' text-red-700'} disabled={busy} onClick={() => void resolve('suspended')}>Suspend and close reports</button><button className={button} disabled={busy} onClick={() => setMode('idle')}>Cancel</button></div>
    </div>}
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </section>;
}
