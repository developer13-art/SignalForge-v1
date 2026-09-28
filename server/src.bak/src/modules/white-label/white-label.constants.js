/**
 * White Label Constants
 *
 * Shared constants for white-label projects.
 *
 * @module server/modules/white-label/white-label.constants
 */
const WHITE_LABEL_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  ARCHIVED: 'ARCHIVED',
});
const WHITE_LABEL_STATUS_VALUES = Object.freeze(Object.values(WHITE_LABEL_STATUSES));
const DOMAIN_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  VERIFYING: 'VERIFYING',
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
});
const DOMAIN_STATUS_VALUES = Object.freeze(Object.values(DOMAIN_STATUSES));
const THEME_MODES = Object.freeze({
  LIGHT: 'LIGHT',
  DARK: 'DARK',
  SYSTEM: 'SYSTEM',
});
const THEME_MODE_VALUES = Object.freeze(Object.values(THEME_MODES));
const DEFAULT_THEME = Object.freeze({
  mode: 'SYSTEM',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  primaryColor: '#0ea5e9',
  accentColor: '#f59e0b',
});
const DEFAULT_BRANDING = Object.freeze({
  brandName: null,
  logoUrl: null,
  faviconUrl: null,
  primaryColor: '#0ea5e9',
  secondaryColor: '#1e293b',
  supportEmail: null,
});
const DNS_VERIFICATION_PREFIX = '_signalforge-verify';
function isValidWhiteLabelStatus(status) {
  return WHITE_LABEL_STATUS_VALUES.includes(status);
}
function isValidDomainStatus(status) {
  return DOMAIN_STATUS_VALUES.includes(status);
}
function isValidThemeMode(mode) {
  return THEME_MODE_VALUES.includes(mode);
}
module.exports.WHITE_LABEL_STATUSES = WHITE_LABEL_STATUSES;
module.exports.WHITE_LABEL_STATUS_VALUES = WHITE_LABEL_STATUS_VALUES;
module.exports.DOMAIN_STATUSES = DOMAIN_STATUSES;
module.exports.DOMAIN_STATUS_VALUES = DOMAIN_STATUS_VALUES;
module.exports.THEME_MODES = THEME_MODES;
module.exports.THEME_MODE_VALUES = THEME_MODE_VALUES;
module.exports.DEFAULT_THEME = DEFAULT_THEME;
module.exports.DEFAULT_BRANDING = DEFAULT_BRANDING;
module.exports.DNS_VERIFICATION_PREFIX = DNS_VERIFICATION_PREFIX;
module.exports.isValidWhiteLabelStatus = isValidWhiteLabelStatus;
module.exports.isValidDomainStatus = isValidDomainStatus;
module.exports.isValidThemeMode = isValidThemeMode;
