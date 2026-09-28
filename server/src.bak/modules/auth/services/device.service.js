/**
 * Device Service
 *
 * @module signalforge/server/modules/auth/services/device
 */

import { DEVICE_TYPES } from '../auth.constants.js';

export class DeviceService {
  constructor(repository) {
    this.repository = repository;
  }

  detectDeviceType(userAgent) {
    if (!userAgent || typeof userAgent !== 'string') {
      return DEVICE_TYPES.UNKNOWN;
    }

    const ua = userAgent.toLowerCase();

    if (/ipad|tablet|playbook|silk/.test(ua)) {
      return DEVICE_TYPES.TABLET;
    }
    if (/mobile|iphone|ipod|android.*mobile|windows phone/.test(ua)) {
      return DEVICE_TYPES.MOBILE;
    }
    if (/electron|tauri|desktop/.test(ua)) {
      return DEVICE_TYPES.DESKTOP;
    }
    if (/mozilla|chrome|safari|firefox|edge/.test(ua)) {
      return DEVICE_TYPES.WEB;
    }

    return DEVICE_TYPES.UNKNOWN;
  }

  extractDeviceLabel(userAgent) {
    if (!userAgent || typeof userAgent !== 'string') {
      return null;
    }

    const ua = userAgent.toLowerCase();

    if (ua.includes('chrome') && !ua.includes('edg')) {
      return 'Chrome';
    }
    if (ua.includes('firefox')) {
      return 'Firefox';
    }
    if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'Safari';
    }
    if (ua.includes('edg')) {
      return 'Edge';
    }
    if (ua.includes('opera') || ua.includes('opr')) {
      return 'Opera';
    }

    return null;
  }

  extractDeviceMeta(req) {
    const userAgent = req.headers['user-agent'] || null;
    const deviceId = req.headers['x-device-id'] || null;
    const deviceLabel =
      req.headers['x-device-label'] || this.extractDeviceLabel(userAgent);

    return {
      ipAddress: req.ip || null,
      userAgent,
      deviceId,
      deviceType: this.detectDeviceType(userAgent),
      deviceLabel,
    };
  }

  async listUserDevices(userId) {
    const sessions = await this.repository.listUserSessions(userId);
    const deviceMap = new Map();

    for (const session of sessions) {
      const key = session.device_id || session.id;
      if (!deviceMap.has(key)) {
        deviceMap.set(key, {
          deviceId: session.device_id,
          deviceType: session.device_type,
          deviceLabel: session.device_label,
          ipAddress: session.ip_address,
          userAgent: session.user_agent,
          lastUsedAt: session.last_used_at,
          firstSeenAt: session.created_at,
          sessionCount: 0,
        });
      }
      deviceMap.get(key).sessionCount++;
    }

    return Array.from(deviceMap.values());
  }
}

export default DeviceService;