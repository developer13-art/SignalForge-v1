/**
 * Device Service (User Module)
 *
 * @module signalforge/server/modules/users/devices/service
 */

import { DeviceRepository } from './device.repository.js';
import { emitDeviceRemoved } from '../user.events.js';

export class DeviceService {
  constructor(repository = null) {
    this.repository = repository || new DeviceRepository();
  }

  async list(userId) {
    const devices = await this.repository.listByUser(userId);
    return devices.map((d) => this.serialize(d));
  }

  async remove(userId, deviceId) {
    const count = await this.repository.removeDevice(userId, deviceId);
    if (count > 0) {
      await emitDeviceRemoved(userId, deviceId);
    }
    return { removed: count > 0, sessionsRevoked: count };
  }

  serialize(row) {
    return {
      deviceId: row.device_id,
      deviceType: row.device_type,
      deviceLabel: row.device_label,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      lastUsedAt: row.last_used_at,
      firstSeenAt: row.first_seen_at,
      sessionCount: row.session_count,
    };
  }
}

export default DeviceService;