/**
 * Audit Events
 *
 * Publishes audit-related events on the platform Event Bus. Other
 * services may subscribe for real-time alerting on high-severity
 * actions.
 *
 * @module server/modules/audit/audit.events
 */

import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { publishEvent } from '../../events/event-publisher';

const SOURCE = 'audit.events';

export async function emitAuditLogCreated({ auditId, action, actorId, actorType, resourceType, resourceId, severity }) {
  return publishEvent({
    eventType: EVENT_TYPES.AUDIT_LOG_CREATED,
    source: SOURCE,
    actorId: actorId || null,
    payload: {
      auditId,
      action,
      actorId: actorId || null,
      actorType: actorType || 'SYSTEM',
      resourceType: resourceType || null,
      resourceId: resourceId || null,
      severity: severity || 'INFO',
    },
  });
}

export async function emitSecurityAlert({ actorId, alertType, details }) {
  return publishEvent({
    eventType: EVENT_TYPES.SECURITY_ALERT,
    source: SOURCE,
    actorId: actorId || null,
    payload: {
      actorId: actorId || null,
      alertType,
      details: details || null,
      raisedAt: new Date().toISOString(),
    },
  });
}

export const AUDIT_EVENT_NAMES = Object.freeze({
  AUDIT_LOG_CREATED: EVENT_TYPES.AUDIT_LOG_CREATED,
  SECURITY_ALERT: EVENT_TYPES.SECURITY_ALERT,
});