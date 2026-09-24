/**
 * WebSocket Auth
 *
 * Authenticates incoming WebSocket connections using the same JWT
 * that guards the HTTP API. On success, attaches the user context to
 * the socket; on failure, rejects the connection.
 *
 * @module server/realtime/websocket-auth
 */

import { verifyAccessToken } from '../utils/jwt.util';
import { logger } from '../lib/logger';
import { db } from '../database';

export async function authenticateWebSocket({ token }) {
  if (!token || typeof token !== 'string') {
    return { authenticated: false, reason: 'MISSING_TOKEN' };
  }

  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    logger.debug({ err }, 'WebSocket token verification failed');
    return { authenticated: false, reason: 'INVALID_TOKEN' };
  }

  if (!payload || !payload.sub) {
    return { authenticated: false, reason: 'INVALID_PAYLOAD' };
  }

  const { rows } = await db.query(
    `SELECT id, email, status, kyc_status FROM users WHERE id = $1 LIMIT 1`,
    [payload.sub],
  );

  const user = rows[0];

  if (!user) {
    return { authenticated: false, reason: 'USER_NOT_FOUND' };
  }

  if (user.status !== 'ACTIVE') {
    return { authenticated: false, reason: 'ACCOUNT_INACTIVE' };
  }

  const { rows: roleRows } = await db.query(
    `SELECT r.name AS role_name
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = $1`,
    [user.id],
  );

  return {
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      kycStatus: user.kyc_status,
      roles: roleRows.map((r) => r.role_name),
    },
  };
}

export const websocketAuth = {
  authenticateWebSocket,
};