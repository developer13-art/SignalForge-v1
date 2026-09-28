/**
 * Ticket Routes
 *
 * Express routes for user-facing support ticket operations. All
 * routes require authentication.
 *
 * @module server/modules/support/ticket.routes
 */
const { Router } = require('express');
const { ticketController } = require('./ticket.controller');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware');
const { asyncHandler } = require('../../lib/async-handler');

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
module.exports = router;