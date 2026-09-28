/**
 * Session Service (Risk)
 *
 * @module signalforge/server/modules/risk/market-data/session
 */

const SESSIONS = Object.freeze({
  SYDNEY: { open: 22 * 60, close: 7 * 60 },
  TOKYO: { open: 0, close: 9 * 60 },
  LONDON: { open: 8 * 60, close: 17 * 60 },
  NEW_YORK: { open: 13 * 60, close: 22 * 60 },
});

export class SessionService {
  isInSession(date, sessionName) {
    const session = SESSIONS[sessionName];
    if (!session) {
      return false;
    }
    const minutes = date.getUTCHours() * 60 + date.getUTCMinutes();
    if (session.open < session.close) {
      return minutes >= session.open && minutes < session.close;
    }
    return minutes >= session.open || minutes < session.close;
  }

  getActiveSessions(date = new Date()) {
    const active = [];
    for (const sessionName of Object.keys(SESSIONS)) {
      if (this.isInSession(date, sessionName)) {
        active.push(sessionName);
      }
    }
    return active;
  }

  listSessions() {
    return Object.keys(SESSIONS);
  }
}

export default SessionService;