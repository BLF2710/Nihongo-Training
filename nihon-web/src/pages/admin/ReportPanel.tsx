import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveReports } from '../../api/moderation';
import type { ReportResolution, ReportSummary } from '../../api/moderation';
import { timeAgo } from '../../lib/notifications';
import { adminError, button, dangerButton, input, primaryButton } from './adminData';
import { Chip, NameBadge } from './AdminUi';

const MAX_WARNING_LENGTH = 1000;
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
const KIND_LABEL: Record<string, string> = { profile: '👤 Profile', message: '💬 Message' };

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-gray-50 px-3 py-2"><dt className="text-xs text-gray-500">{label}</dt><dd className="font-bold text-gray-900">{value}</dd></div>;
}

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
  return <section aria-label={`Reports about ${learner.username}`} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${summary.isRepeated ? 'border-red-300' : 'border-gray-200'}`}>
    {summary.isRepeated && <p className="flex items-center gap-2 bg-red-50 px-5 py-2 text-sm font-bold text-red-800"><span aria-hidden="true">⚠️</span>Reported repeatedly — {plural(summary.recentReporters, 'different learner')} recently</p>}
    <div className="p-5">
      <div className="flex flex-wrap items-start gap-3">
        <NameBadge name={learner.username} />
        <div className="min-w-0 flex-1">
          <p className="font-black text-gray-900">{learner.displayName} <span className="font-normal text-gray-500">@{learner.username}</span></p>
          <p className="text-sm text-gray-600">{plural(summary.openReports, 'open report')} from {plural(summary.reporters, 'learner')}</p>
        </div>
        {learner.status !== 'active' && <Chip tone="danger" icon="⏸">{learner.status}</Chip>}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Fact label="About" value={summary.kinds.map(kind => KIND_LABEL[kind] ?? kind).join(' · ')} />
        <Fact label="First report" value={timeAgo(summary.firstAt)} />
        <Fact label="Latest report" value={timeAgo(summary.lastAt)} />
        <Fact label="Resolved before" value={String(summary.earlierResolved)} />
      </dl>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {summary.ticketIds.map(id => <Link key={id} className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800" to={`/admin/support?status=all&id=${id}`}>Request #{id}</Link>)}
        <Link className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800" to={`/admin/users?search=${encodeURIComponent(learner.username)}`}>Account →</Link>
      </div>
      {mode === 'idle' && <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <button className={button} disabled={busy} onClick={() => void resolve('dismissed')} aria-label={`Dismiss reports about ${learner.username}`}>✓ Dismiss</button>
        <button className={button + ' border-amber-300 text-amber-900'} disabled={busy} onClick={() => setMode('warned')} aria-label={`Warn ${learner.username}`}>⚠️ Warn</button>
        {learner.status === 'active' && <button className={button + ' border-red-300 text-red-700'} disabled={busy} onClick={() => setMode('suspended')} aria-label={`Suspend ${learner.username}`}>⏸ Suspend</button>}
      </div>}
      {mode === 'warned' && <div className="mt-4 rounded-xl bg-amber-50 p-4">
        <label className="text-sm font-semibold">Warning sent to @{learner.username} as a support message<textarea className={input} rows={3} maxLength={MAX_WARNING_LENGTH} value={warning} onChange={event => setWarning(event.target.value)} /></label>
        <div className="mt-2 flex flex-wrap gap-2"><button className={primaryButton} disabled={busy || !warning.trim()} onClick={() => void resolve('warned')}>Send warning and close reports</button><button className={button} disabled={busy} onClick={() => setMode('idle')}>Cancel</button></div>
      </div>}
      {mode === 'suspended' && <div className="mt-4 rounded-xl bg-red-50 p-4" role="group" aria-label="Confirm suspension">
        <p className="text-sm text-red-900">Suspend @{learner.username}? They're signed out and can't sign in until an administrator reactivates the account in Users & roles.</p>
        <div className="mt-2 flex flex-wrap gap-2"><button className={dangerButton} disabled={busy} onClick={() => void resolve('suspended')}>Suspend and close reports</button><button className={button} disabled={busy} onClick={() => setMode('idle')}>Cancel</button></div>
      </div>}
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  </section>;
}
