/**
 * Security Service
 *
 * Top-level orchestration for platform-wide security operations.
 * Delegates to specialized services for encryption, secrets vault,
 * API keys, session monitoring, threat detection, and RBAC guards.
 *
 * @module server/modules/security/security.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { encryptionService } from './encryption.service';
import { secretsVaultService } from './secrets-vault.service';
import { apiKeyService } from './api-key.service';
import { sessionMonitorService } from './session-monitor.service';
import { threatDetectionService } from './threat-detection.service';
import { guardService } from './rbac/guard.service';
import { permissionCheckerService } from './rbac/permission-checker.service';
import { featureAccessService } from './rbac/feature-access.service';

export async function getSecurityOverview() {
  const [threatSummary, activeSessionCount] = await Promise.all([
    threatDetectionService.getThreatSummary().catch(() => ({ totalThreats: 0, bySeverity: {} })),
    sessionMonitorService.countActiveSessions().catch(() => 0),
  ]);

  return {
    threatSummary,
    activeSessionCount,
    checkedAt: new Date().toISOString(),
  };
}

export async function rotateEncryptionKey({ currentKey, newKey }) {
  if (!newKey) {
    throw new AppError('newKey is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return encryptionService.rotateKey({ currentKey, newKey });
}

export async function validateRequestContext({ userId, ipAddress, userAgent }) {
  if (!userId) {
    return { allowed: true, action: 'NO_USER' };
  }

  const threat = await threatDetectionService.evaluateRequest({
    userId,
    ipAddress,
    userAgent,
  });

  if (!threat.allowed) {
    throw new AppError(
      `Request blocked: ${threat.reason}`,
      ERROR_CODES.SECURITY_REQUEST_BLOCKED,
      403,
    );
  }

  return threat;
}

export const securityService = {
  getSecurityOverview,
  rotateEncryptionKey,
  validateRequestContext,

  encryption: encryptionService,
  secretsVault: secretsVaultService,
  apiKeys: apiKeyService,
  sessions: sessionMonitorService,
  threats: threatDetectionService,
  guards: guardService,
  permissions: permissionCheckerService,
  featureAccess: featureAccessService,
};