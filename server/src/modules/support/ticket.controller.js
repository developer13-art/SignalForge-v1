/**
 * Ticket Controller
 *
 * HTTP handlers for support ticket operations.
 *
 * @module server/modules/support/ticket.controller
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { successResponse } from '../../lib/response/success.response';
import { paginatedResponse } from '../../lib/response/paginated.response';
import { ticketService } from './ticket.service';
import { validateCreateTicketPayload, validateAddMessagePayload } from './ticket.validator';

export async function createTicket(req, res) {
  const userId = req.user && req.user.id;
  const payload = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const validated = validateCreateTicketPayload(payload);

  const ticket = await ticketService.createTicket({
    userId,
    ...validated,
  });

  logger.info({ userId, ticketId: ticket.ticketId }, 'Ticket created');

  return successResponse(res, { ticket }, 201);
}

export async function getTicket(req, res) {
  const userId = req.user && req.user.id;
  const { ticketId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const ticket = await ticketService.getTicket({ ticketId, userId });

  return successResponse(res, { ticket });
}

export async function addMessage(req, res) {
  const userId = req.user && req.user.id;
  const { ticketId } = req.params;
  const payload = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const validated = validateAddMessagePayload(payload);

  const result = await ticketService.addMessage({
    ticketId,
    authorId: userId,
    authorType: 'USER',
    message: validated.message,
    attachments: validated.attachments,
  });

  return successResponse(res, { message: result }, 201);
}

export async function listMyTickets(req, res) {
  const userId = req.user && req.user.id;
  const { page, limit, status, category, priority } = req.query;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await ticketService.listUserTickets({
    userId,
    filters: { status, category, priority },
    pagination: { page, limit },
  });

  return paginatedResponse(res, {
    items: result.items,
    meta: result.meta,
  });
}

export async function getMyStats(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const stats = await ticketService.getUserTicketStats({ userId });

  return successResponse(res, { stats });
}

export async function closeTicket(req, res) {
  const userId = req.user && req.user.id;
  const { ticketId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const ticket = await ticketService.getTicket({ ticketId, userId });

  if (!ticket) {
    throw new AppError('Ticket not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await ticketService.updateStatus({
    ticketId,
    status: 'CLOSED',
    reason: 'Closed by user',
    actorId: userId,
  });

  return successResponse(res, { closed: true });
}

export const ticketController = {
  createTicket,
  getTicket,
  addMessage,
  listMyTickets,
  getMyStats,
  closeTicket,
};