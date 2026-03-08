/**
 * Audit log — records moderation/admin actions to Firestore.
 *
 * Usage:
 *   import { logAuditEvent } from '@/lib/auditLog';
 *   logAuditEvent({ actor: user.email, action: 'delete_post', target_type: 'post', target_id: '123' });
 */

import { auditLogsCol, addDoc, Timestamp } from './firebaseConfig';

/**
 * Write an audit event to Firestore (fire-and-forget).
 */
export async function logAuditEvent({
    actor,
    action,
    target_type,
    target_id,
    school_id = null,
    metadata = {},
}) {
    try {
        addDoc(auditLogsCol, {
            actor,
            action,
            target_type,
            target_id,
            school_id,
            metadata,
            timestamp: Timestamp.now(),
        }).catch(err => {
            console.warn('[audit] Failed to write audit log:', err.message);
        });
    } catch {
        // Never let audit logging break the app
    }
}
