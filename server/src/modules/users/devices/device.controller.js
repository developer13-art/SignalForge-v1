/**
 * Device Controller (User Module)
 *
 * @module signalforge/server/modules/users/devices/controller
 */

import { DeviceService } from './device.service.js';

export class DeviceController {
  constructor(service = null) {
    this.service = service || new DeviceService();
  }

  listDevices = async (req, res, next) => {
    try {
      const devices = await this.service.list(req.user.id);
      res.status(200).json({ devices });
    } catch (error) {
      next(error);
    }
  };

  removeDevice = async (req, res, next) => {
    try {
      const result = await this.service.remove(req.user.id, req.params.deviceId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default DeviceController;