/**
 * Ticket Service
 *
 * Top-level orchestration for support tickets: creation, message
 * threads, status transitions, assignment, and SLA tracking.
 *
 * @module server/modules/support/ticket.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import { db } from '../../database';
import { publishEvent } from '../../events/event-publisher';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import {
  TICKET_STATUSES,
  getResponseSlaMinutes,
  getResolutionSlaMinutes,
} from './ticket.constants';
import * as repository from './ticket.repository';

function generateTicketNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SF-${timestamp}-${random}`;
}

function computeSlaDeadlines({ priority }) {
  const responseMinutes = getResponseSlaMinutes(priority);
  const resolutionMinutes = getResolutionSlaMinutes(priority);

  return {
    responseDueAt: new Date(Date.now() + responseMinutes * 60 * 1000).toISOString(),
    resolutionDueAt: new Date(Date.now() + resolutionMinutes * 60 * 1000).toISOString(),
  };
}

export async function createTicket({ userId, subject, message, priority, category, attachments, metadata }) {
  if (!userId || !subject || !message) {
    throw new AppError('userId, subject, and message are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const ticketNumber = generateTicketNumber();
  const { responseDueAt, resolutionDueAt } = computeSlaDeadlines({ priority });

  const ticket = await repository.insertTicket({
    userId,
    subject,
    priority,
    category,
    source: 'WEB',
    metadata,
    responseDueAt,
    resolutionDueAt,
  });

  await db.query(
    `UPDATE support_tickets SET ticket_number = $1 WHERE id = $2`,
    [ticketNumber, ticket.id],
  );

  await repository.insertMessage({
    ticketId: ticket.id,
    authorId: userId,
    authorType: 'USER',
    body: message,
    attachments,
  });

  await publishEvent({
    eventType: EVENT_TYPES.SUPPORT_TICKET_CREATED,
    source: 'ticket.service',
    actorId: userId,
    payload: {
      ticketId: ticket.id,
      ticketNumber,
      userId,
      subject,
      priority,
      category,
    },
  }).catch((err) => logger.warn({ err }, 'Failed to publish ticket created event'));

  logger.info({ userId, ticketId: ticket.id, ticketNumber }, 'Support ticket created');

  return {
    ticketId: ticket.id,
    ticketNumber,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    responseDueAt,
    resolutionDueAt,
    createdAt: ticket.created_at,
  };
}

export async function getTicket({ ticketId, userId, isAgent = false, agentId = null }) {
  if (!ticketId) {
    throw new AppError('ticketId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const ticket = await repository.findById({ ticketId });

  if (!ticket) {
    throw new AppError('Ticket not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (!isAgent && ticket.user_id !== userId) {
    throw new AppError('Ticket does not belong to the requesting user', ERROR_CODES.AUTHORIZATION_FAILED, 403);
  }

  const messages = await repository.listMessages({ ticketId });

  return {
    ticketId: ticket.id,
    ticketNumber: ticket.ticket_number,
    userId: ticket.user_id,
    subject: ticket.subject,
    status: ticket.status,
    statusReason: ticket.status_reason,
    priority: ticket.priority,
    category: ticket.category,
    source: ticket.source,
    assignedAgentId: ticket.assigned_agent_id,
    firstRespondedAt: ticket.first_responded_at,
    resolvedAt: ticket.resolved_at,
    responseDueAt: ticket.response_due_at,
    resolutionDueAt: ticket.resolution_due_at,
    reopenedCount: ticket.reopened_count,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    messages: messages.map((row) => ({
      messageId: row.id,
      authorId: row.author_id,
      authorType: row.author_type,
      body: row.body,
      attachments: row.attachments ? (typeof row.attachments === 'string' ? JSON.parse(row.attachments) : row.attachments) : [],
      createdAt: row.created_at,
    })),
  };
}

export async function addMessage({ ticketId, authorId, authorType, message, attachments, isAgent = false }) {
  if (!ticketId || !authorId || !message) {
    throw new AppError('ticketId, authorId, and message are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const ticket = await repository.findById({ ticketId });

  if (!ticket) {
    throw new AppError('Ticket not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (!isAgent && ticket.user_id !== authorId) {
    throw new AppError('Ticket does not belong to the requesting user', ERROR_CODES.AUTHORIZATION_FAILED, 403);
  }

  if (ticket.status === TICKET_STATUSES.CLOSED) {
    if (!isAgent) {
      await repository.updateStatus({
        ticketId,
        status: TICKET_STATUSES.REOPENED,
        reason: 'User replied to closed ticket',
      });
      await repository.incrementReopenedCount({ ticketId });
    } else {
      throw new AppError('Cannot add message to a closed ticket', ERROR_CODES.CONFLICT, 409);
    }
  }

  const row = await repository.insertMessage({
    ticketId,
    authorId,
    authorType,
    body: message,
    attachments,
  });

  if (authorType === 'AGENT') {
    await repository.touchFirstResponse({ ticketId });

    if (ticket.status === TICKET_STATUSES.OPEN || ticket.status === TICKET_STATUSES.PENDING_AGENT) {
      await repository.updateStatus({
        ticketId,
        status: TICKET_STATUSES.PENDING_USER,
        reason: 'Agent replied',
      });
    }
  } else if (authorType === 'USER' && ticket.status === TICKET_STATUSES.PENDING_USER) {
    await repository.updateStatus({
      ticketId,
      status: TICKET_STATUSES.PENDING_AGENT,
      reason: 'User replied',
    });
  }

  await publishEvent({
    eventType: EVENT_TYPES.SUPPORT_TICKET_REPLY,
    source: 'ticket.service',
    actorId: authorId,
    payload: {
      ticketId,
      authorType,
      messageId: row.id,
    },
  }).catch((err) => logger.warn({ err }, 'Failed to publish ticket reply event'));

  return {
    messageId: row.id,
    ticketId,
    authorType: row.author_type,
    createdAt: row.created_at,
  };
}

export async function updateStatus({ ticketId, status, reason, actorId }) {
  if (!ticketId || !status) {
    throw new AppError('ticketId and status are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const ticket = await repository.findById({ ticketId });

  if (!ticket) {
    throw new AppError('Ticket not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const updated = await repository.updateStatus({ ticketId, status, reason });

  if (!updated) {
    throw new AppError('Failed to update ticket status', ERROR_CODES.INTERNAL_ERROR, 500);
  }

  logger.info({ ticketId, status, actorId }, 'Ticket status updated');

  return { updated: true, status };
}

export async function updatePriority({ ticketId, priority, actorId }) {
  if (!ticketId || !priority) {
    throw new AppError('ticketId and priority are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updatePriority({ ticketId, priority });

  if (!updated) {
    throw new AppError('Ticket not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const { responseDueAt, resolutionDueAt } = computeSlaDeadlines({ priority });

  await db.query(
    `UPDATE support_tickets
        SET response_due_at = $1, resolution_due_at = $2, updated_at = $3
      WHERE id = $4`,
    [responseDueAt, resolutionDueAt, nowIso(), ticketId],
  );

  logger.info({ ticketId, priority, actorId }, 'Ticket priority updated');

  return { updated: true, priority, responseDueAt, resolutionDueAt };
}

export async function assignToAgent({ ticketId, agentId, actorId }) {
  if (!ticketId || !agentId) {
    throw new AppError('ticketId and agentId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.assignAgent({ ticketId, agentId });

  if (!updated) {
    throw new AppError('Ticket not found', ERROR_CODES.NOT_FOUND, 404);
  }

  logger.info({ ticketId, agentId, actorId }, 'Ticket assigned');

  return { assigned: true, agentId };
}

export async function listUserTickets({ userId, filters = {}, pagination = {} }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listByUser({
    userId,
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      ticketId: row.id,
      ticketNumber: row.ticket_number,
      subject: row.subject,
      status: row.status,
      priority: row.priority,
      category: row.category,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function listAgentTickets({ agentId, filters = {}, pagination = {} }) {
  if (!agentId) {
    throw new AppError('agentId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listAssignedToAgent({
    agentId,
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      ticketId: row.id,
      ticketNumber: row.ticket_number,
      userId: row.user_id,
      subject: row.subject,
      status: row.status,
      priority: row.priority,
      category: row.category,
      responseDueAt: row.response_due_at,
      resolutionDueAt: row.resolution_due_at,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function listQueue({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listByQueue({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      ticketId: row.id,
      ticketNumber: row.ticket_number,
      userId: row.user_id,
      subject: row.subject,
      status: row.status,
      priority: row.priority,
      category: row.category,
      assignedAgentId: row.assigned_agent_id,
      responseDueAt: row.response_due_at,
      resolutionDueAt: row.resolution_due_at,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function listSlaBreaches({ limit = 100 }) {
  const rows = await repository.listSlaBreaches({ limit });

  return rows.map((row) => ({
    ticketId: row.id,
    ticketNumber: row.ticket_number,
    userId: row.user_id,
    subject: row.subject,
    status: row.status,
    priority: row.priority,
    responseDueAt: row.response_due_at,
    resolutionDueAt: row.resolution_due_at,
    firstRespondedAt: row.first_responded_at,
    resolvedAt: row.resolved_at,
  }));
}

export async function getUserTicketStats({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.countByStatusForUser({ userId });

  const stats = {};
  for (const row of rows) {
    stats[row.status] = row.count;
  }

  return stats;
}

export async function getAgentTicketStats({ agentId }) {
  if (!agentId) {
    throw new AppError('agentId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.countByStatusForAgent({ agentId });

  const stats = {};
  for (const row of rows) {
    stats[row.status] = row.count;
  }

  return stats;
}

export async function getGlobalTicketStats() {
  const rows = await repository.countAllByStatus();

  const stats = {};
  for (const row of rows) {
    stats[row.status] = row.count;
  }

  return stats;
}

export const ticketService = {
  createTicket,
  getTicket,
  addMessage,
  updateStatus,
  updatePriority,
  assignToAgent,
  listUserTickets,
  listAgentTickets,
  listQueue,
  listSlaBreaches,
  getUserTicketStats,
  getAgentTicketStats,
  getGlobalTicketStats,
};