/**
 * Security Service
 *
 * Top-level orchestration for platform-wide security operations.
 * Delegates to specialized services for encryption, secrets vault,
 * API keys, session monitoring, threat detection, and RBAC guards.
 *
 * @module server/modules/security/security.service
 */
const { AppError } = require('../../lib/errors/app-error');
const { ERROR_CODES } = require('../../lib/errors/error-codes');
const { encryptionService } = require('./encryption.service');
const { secretsVaultService } = require('./secrets-vault.service');
const { apiKeyService } = require('./api-key.service');
const { sessionMonitorService } = require('./session-monitor.service');
const { threatDetectionService } = require('./threat-detection.service');
const { guardService } = require('./rbac/guard.service');
const { permissionCheckerService } = require('./rbac/permission-checker.service');
const { featureAccessService } = require('./rbac/feature-access.service');
async function getSecurityOverview() {
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
async function rotateEncryptionKey({ currentKey, newKey }) {
  if (!newKey) {
    throw new AppError('newKey is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return encryptionService.rotateKey({ currentKey, newKey });
}
async function validateRequestContext({ userId, ipAddress, userAgent }) {
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
const securityService = {
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
module.exports.securityService = securityService;

module.exports.getSecurityOverview = getSecurityOverview;

module.exports.rotateEncryptionKey = rotateEncryptionKey;

module.exports.validateRequestContext = validateRequestContext;
