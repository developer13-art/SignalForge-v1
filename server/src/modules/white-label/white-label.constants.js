/**
 * White Label Constants
 *
 * Shared constants for white-label projects.
 *
 * @module server/modules/white-label/white-label.constants
 */

export const WHITE_LABEL_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  ARCHIVED: 'ARCHIVED',
});

export const WHITE_LABEL_STATUS_VALUES = Object.freeze(Object.values(WHITE_LABEL_STATUSES));

export const DOMAIN_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  VERIFYING: 'VERIFYING',
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
});

export const DOMAIN_STATUS_VALUES = Object.freeze(Object.values(DOMAIN_STATUSES));

export const THEME_MODES = Object.freeze({
  LIGHT: 'LIGHT',
  DARK: 'DARK',
  SYSTEM: 'SYSTEM',
});

export const THEME_MODE_VALUES = Object.freeze(Object.values(THEME_MODES));

export const DEFAULT_THEME = Object.freeze({
  mode: 'SYSTEM',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  primaryColor: '#0ea5e9',
  accentColor: '#f59e0b',
});

export const DEFAULT_BRANDING = Object.freeze({
  brandName: null,
  logoUrl: null,
  faviconUrl: null,
  primaryColor: '#0ea5e9',
  secondaryColor: '#1e293b',
  supportEmail: null,
});

export const DNS_VERIFICATION_PREFIX = '_signalforge-verify';

export function isValidWhiteLabelStatus(status) {
  return WHITE_LABEL_STATUS_VALUES.includes(status);
}

export function isValidDomainStatus(status) {
  return DOMAIN_STATUS_VALUES.includes(status);
}

export function isValidThemeMode(mode) {
  return THEME_MODE_VALUES.includes(mode);
}