/**
 * TradingView Auth Service
 *
 * @module signalforge/server/modules/signal-sources/tradingview/auth
 */

import crypto from 'node:crypto';

import tradingViewConfig from '../../../config/tradingview.config.js';

export class TradingViewAuthService {
  generateSecret() {
    return crypto.randomBytes(32).toString('base64url');
  }

  verifySecret(provided, expected) {
    if (!provided || !expected) {
      return false;
    }
    if (provided.length !== expected.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  }

  isIpAllowed(ip, allowedIps = null) {
    const list = allowedIps && allowedIps.length > 0
      ? allowedIps
      : tradingViewConfig.ipWhitelist;

    if (!list || list.length === 0) {
      return true;
    }

    return list.includes(ip);
  }

  buildRequestSignature(payload, secret) {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(serialized).digest('hex');
  }

  verifyRequestSignature(payload, signature, secret) {
    const expected = this.buildRequestSignature(payload, secret);
    if (signature.length !== expected.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }
}

export default TradingViewAuthService;