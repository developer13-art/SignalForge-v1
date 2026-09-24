/**
 * SLA Service
 *
 * Tracks SLA breaches for support tickets, records them, and provides
 * aggregate reporting used by support and executive dashboards.
 *
 * @module server/modules/support/sla/sla.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import * as repository from './sla.repository';
import { ticketRepository } from '../ticket.repository';

const BREACH_TYPES = Object.freeze({
  RESPONSE: 'RESPONSE',
  RESOLUTION: 'RESOLUTION',
});

async function recordBreachIfNew({ ticketId, breachType, dueAt, minutesOverdue }) {
  const existing = await repository.findExistingBreach({ ticketId, breachType });

  if (existing) {
    return { recorded: false, alreadyExists: true };
  }

  const breach = await repository.insertBreach({
    ticketId,
    breachType,
    dueAt,
    minutesOverdue,
  });

  logger.info({ ticketId, breachType, minutesOverdue }, 'SLA breach recorded');

  return { recorded: true, breachId: breach.id };
}

export async function checkTicketSla({ ticketId }) {
  if (!ticketId) {
    throw new AppError('ticketId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const ticket = await ticketRepository.findById({ ticketId });

  if (!ticket) {
    throw new AppError('Ticket not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    return { breached: false, reason: 'TICKET_CLOSED' };
  }

  const now = Date.now();
  const results = { response: null, resolution: null };

  if (ticket.response_due_at && !ticket.first_responded_at) {
    const dueAt = new Date(ticket.response_due_at).getTime();

    if (now > dueAt) {
      const minutesOverdue = Math.round((now - dueAt) / 60000);
      results.response = await recordBreachIfNew({
        ticketId,
        breachType: BREACH_TYPES.RESPONSE,
        dueAt: ticket.response_due_at,
        minutesOverdue,
      });
    }
  }

  if (ticket.resolution_due_at && !ticket.resolved_at) {
    const dueAt = new Date(ticket.resolution_due_at).getTime();

    if (now > dueAt) {
      const minutesOverdue = Math.round((now - dueAt) / 60000);
      results.resolution = await recordBreachIfNew({
        ticketId,
        breachType: BREACH_TYPES.RESOLUTION,
        dueAt: ticket.resolution_due_at,
        minutesOverdue,
      });
    }
  }

  return {
    breached: Boolean(results.response?.recorded || results.resolution?.recorded),
    results,
  };
}

export async function sweepOpenTicketsForBreaches({ limit = 200 }) {
  const breaches = await ticketRepository.listSlaBreaches({ limit });

  const results = [];

  for (const ticket of breaches) {
    try {
      const result = await checkTicketSla({ ticketId: ticket.id });
      results.push({ ticketId: ticket.id, ...result });
    } catch (err) {
      logger.warn({ err, ticketId: ticket.id }, 'SLA check failed for ticket');
      results.push({ ticketId: ticket.id, error: err.message });
    }
  }

  return { checked: results.length, results };
}

export async function listBreachesForTicket({ ticketId }) {
  if (!ticketId) {
    throw new AppError('ticketId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.listBreachesForTicket({ ticketId });

  return rows.map((row) => ({
    breachId: row.id,
    breachType: row.breach_type,
    dueAt: row.due_at,
    minutesOverdue: row.minutes_overdue,
    recordedAt: row.recorded_at,
  }));
}

export async function listRecentBreaches({ limit = 100 }) {
  const rows = await repository.listRecentBreaches({ limit });

  return rows.map((row) => ({
    breachId: row.id,
    ticketId: row.ticket_id,
    ticketNumber: row.ticket_number,
    subject: row.subject,
    priority: row.priority,
    breachType: row.breach_type,
    dueAt: row.due_at,
    minutesOverdue: row.minutes_overdue,
    recordedAt: row.recorded_at,
  }));
}

export async function aggregateBreaches({ windowDays = 30 } = {}) {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  const rows = await repository.aggregateBreachesByType({ since });

  const stats = {
    windowDays,
    since,
    response: 0,
    resolution: 0,
    total: 0,
  };

  for (const row of rows) {
    if (row.breach_type === BREACH_TYPES.RESPONSE) {
      stats.response = row.count;
    }
    if (row.breach_type === BREACH_TYPES.RESOLUTION) {
      stats.resolution = row.count;
    }
    stats.total += row.count;
  }

  return stats;
}

export const slaService = {
  checkTicketSla,
  sweepOpenTicketsForBreaches,
  listBreachesForTicket,
  listRecentBreaches,
  aggregateBreaches,
  BREACH_TYPES,
};