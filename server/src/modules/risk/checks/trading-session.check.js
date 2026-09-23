/**
 * Trading Session Check
 *
 * @module signalforge/server/modules/risk/checks/trading-session
 */

import { BaseCheck } from './base.check.js';
import { RISK_CHECKS } from '../risk.constants.js';
import { emitRiskSessionBlocked } from '../risk.events.js';

const SESSIONS = Object.freeze({
  SYDNEY: { open: '22:00', close: '07:00' },
  TOKYO: { open: '00:00', close: '09:00' },
  LONDON: { open: '08:00', close: '17:00' },
  NEW_YORK: { open: '13:00', close: '22:00' },
});

function minutesOfDay(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export class TradingSessionCheck extends BaseCheck {
  constructor() {
    super(RISK_CHECKS.TRADING_SESSION);
  }

  isInSession(now, session) {
    const current = now.getUTCHours() * 60 + now.getUTCMinutes();
    const open = minutesOfDay(session.open);
    const close = minutesOfDay(session.close);
    if (open < close) {
      return current >= open && current < close;
    }
    return current >= open || current < close;
  }

  async run(context) {
    const { profile, userId, signal } = context;

    if (!profile || !Array.isArray(profile.trading_sessions) || profile.trading_sessions.length === 0) {
      return this.pass();
    }

    const now = context.referenceTime ? new Date(context.referenceTime) : new Date();

    for (const sessionName of profile.trading_sessions) {
      const session = SESSIONS[sessionName];
      if (session && this.isInSession(now, session)) {
        return this.pass({ session: sessionName });
      }
    }

    await emitRiskSessionBlocked(userId, signal?.symbol || null);
    return this.fail(
      `Current time is outside allowed sessions: ${profile.trading_sessions.join(', ')}`,
      { allowedSessions: profile.trading_sessions },
    );
  }
}

export default TradingSessionCheck;