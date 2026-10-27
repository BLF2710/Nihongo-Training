import type { AuditEntry } from '../../api/moderation';

const RESOLUTION_TEXT: Record<string, string> = { dismissed: 'dismissed', warned: 'warned the learner', suspended: 'suspended the learner' };

/** One line describing what an administrator did, for the audit log. */
export function describeAuditEntry(entry: AuditEntry): string {
  const who = entry.targetUser ? `@${entry.targetUser}` : 'a deleted account';
  const details = entry.details;
  switch (entry.action) {
    case 'user.suspended': return `Suspended ${who}${details.reason === 'reports' ? ' (after reports)' : ''}`;
    case 'user.reactivated': return `Reactivated ${who}`;
    case 'user.role_changed': return `Changed ${who} from ${String(details.from)} to ${String(details.to)}`;
    case 'user.details_changed': return `Edited ${who}: ${Object.keys(details).join(' and ')}`;
    case 'user.lessons_unlocked': return `Unlocked every lesson for ${who}`;
    case 'user.lessons_relocked': return `Restored normal lesson progression for ${who}`;
    case 'settings.updated': return `Updated system settings (registration ${details.registrationEnabled ? 'open' : 'closed'}${details.announcement ? ', announcement set' : ''})`;
    case 'content.enabled': return `Turned on ${entry.targetRef}`;
    case 'content.disabled': return `Turned off ${entry.targetRef}`;
    case 'question.created': return `Added review question ${entry.targetRef} (${String(details.unitId)})`;
    case 'question.updated': return `Edited review question ${entry.targetRef}`;
    case 'question.deleted': return `Deleted review question ${entry.targetRef}`;
    case 'support.replied': return `Replied to “${String(details.subject)}” from ${who}`;
    case 'support.closed': return `Closed “${String(details.subject)}” from ${who}`;
    case 'support.reopened': return `Reopened “${String(details.subject)}” from ${who}`;
    case 'reports.resolved': return `Resolved ${String(details.reports)} report${details.reports === 1 ? '' : 's'} about ${who}: ${RESOLUTION_TEXT[String(details.resolution)] ?? String(details.resolution)}`;
    case 'lesson.published': return `Published lesson “${String(details.title)}”`;
    case 'lesson.reverted': return `Restored the original lesson ${entry.targetRef}`;
    case 'lesson.draft_discarded': return `Discarded the draft of ${entry.targetRef}`;
    default: return entry.action;
  }
}
