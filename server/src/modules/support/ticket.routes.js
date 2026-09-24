/**
 * Ticket Routes
 *
 * Express routes for user-facing support ticket operations. All
 * routes require authentication.
 *
 * @module server/modules/support/ticket.routes
 */

import { Router } from 'express';
import { ticketController } from './ticket.controller';
import { authenticationMiddleware } from '../../middleware/authentication.middleware';
import { asyncHandler } from '../../lib/async-handler';

const router = Router();

router.use(authenticationMiddleware);

router.get(
  '/',
  asyncHandler(ticketController.listMyTickets),
);

router.post(
  '/',
  asyncHandler(ticketController.createTicket),
);

router.get(
  '/stats',
  asyncHandler(ticketController.getMyStats),
);

router.get(
  '/:ticketId',
  asyncHandler(ticketController.getTicket),
);

router.post(
  '/:ticketId/messages',
  asyncHandler(ticketController.addMessage),
);

router.post(
  '/:ticketId/close',
  asyncHandler(ticketController.closeTicket),
);

export default router;