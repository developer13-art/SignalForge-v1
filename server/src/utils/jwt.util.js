/**
 * JWT Utilities
 *
 * @module server/utils/jwt.util
 */

import jwt from 'jsonwebtoken';
import { config } from '../config';

const DEFAULT_ALGORITHM = 'HS256';

function getSecret() {
  const secret = config.jwt && config.jwt.secret;
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }
  return secret;
}

function getAccessOptions() {
  return {
    algorithm: DEFAULT_ALGORITHM,
    expiresIn: (config.jwt && config.jwt.accessExpiresIn) || '15m',
    issuer: (config.jwt && config.jwt.issuer) || 'signalforge',
    audience: (config.jwt && config.jwt.audience) || 'signalforge-api',
  };
}

function getRefreshOptions() {
  return {
    algorithm: DEFAULT_ALGORITHM,
    expiresIn: (config.jwt && config.jwt.refreshExpiresIn) || '30d',
    issuer: (config.jwt && config.jwt.issuer) || 'signalforge',
    audience: (config.jwt && config.jwt.audience) || 'signalforge-api',
  };
}

export function signAccessToken(payload) {
  return jwt.sign(payload, getSecret(), getAccessOptions());
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, getSecret(), getRefreshOptions());
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getSecret(), {
    algorithms: [DEFAULT_ALGORITHM],
    issuer: (config.jwt && config.jwt.issuer) || 'signalforge',
    audience: (config.jwt && config.jwt.audience) || 'signalforge-api',
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, getSecret(), {
    algorithms: [DEFAULT_ALGORITHM],
    issuer: (config.jwt && config.jwt.issuer) || 'signalforge',
    audience: (config.jwt && config.jwt.audience) || 'signalforge-api',
  });
}

export function decodeToken(token) {
  return jwt.decode(token, { complete: true });
}

export const jwtUtil = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};