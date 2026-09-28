/**
 * Session Check
 *
 * @module signalforge/server/modules/validation/validators/session
 */

import {
  VALIDATION_RESULTS,
  VALIDATION_CHECK_NAMES,
  TRADING_SESSIONS,
} from '../validation.constants.js';

function parseMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export class SessionCheck {
  constructor() {
    this.name = VALIDATION_CHECK_NAMES.SESSION;
  }

  isInSession(date, session) {
    const currentMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
    const openMinutes = parseMinutes(session.open);
    const closeMinutes = parseMinutes(session.close);

    if (openMinutes < closeMinutes) {
      return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    }
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  async run(signal, context = {}) {
    const allowedSessions = context.tradingSessions;

    if (!Array.isArray(allowedSessions) || allowedSessions.length === 0) {
      return { name: this.name, result: VALIDATION_RESULTS.PASSED };
    }

    const referenceTime = context.referenceTime ? new Date(context.referenceTime) : new Date();

    for (const sessionName of allowedSessions) {
      const session = TRADING_SESSIONS[sessionName];
      if (session && this.isInSession(referenceTime, session)) {
        return { name: this.name, result: VALIDATION_RESULTS.PASSED };
      }
    }

    return {
      name: this.name,
      result: VALIDATION_RESULTS.FAILED,
      reason: `Signal arrived outside allowed sessions: ${allowedSessions.join(', ')}`,
    };
  }
}

export default SessionCheck;