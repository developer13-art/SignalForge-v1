/**
 * Device Routes (User Module)
 *
 * @module signalforge/server/modules/users/devices/routes
 */

import { Router } from 'express';

import { DeviceController } from './device.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildDeviceRouter(controller = null) {
  const router = Router();
  const deviceController = controller || new DeviceController();

  router.use(authenticationMiddleware());

  router.get('/', deviceController.listDevices);
  router.delete('/:deviceId', deviceController.removeDevice);

  return router;
}

export default buildDeviceRouter;