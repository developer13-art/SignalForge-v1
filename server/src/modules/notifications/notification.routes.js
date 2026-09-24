/**
 * Notification Routes
 *
 * Express routes for notification operations. All routes require
 * authentication.
 *
 * @module server/modules/notifications/notification.routes
 */

import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticationMiddleware } from '../../middleware/authentication.middleware';
import { asyncHandler } from '../../lib/async-handler';

const router = Router();

router.use(authenticationMiddleware);

router.get(
  '/',
  asyncHandler(notificationController.listNotifications),
);

router.get(
  '/unread-count',
  asyncHandler(notificationController.getUnreadCount),
);

router.patch(
  '/:notificationId/read',
  asyncHandler(notificationController.markAsRead),
);

router.patch(
  '/read-all',
  asyncHandler(notificationController.markAllAsRead),
);

router.delete(
  '/:notificationId',
  asyncHandler(notificationController.deleteNotification),
);

router.get(
  '/preferences',
  asyncHandler(notificationController.getPreferences),
);

router.patch(
  '/preferences',
  asyncHandler(notificationController.updatePreferences),
);

export default router;