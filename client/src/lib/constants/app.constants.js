/**
 * Application Constants
 *
 * @module client/src/lib/constants/app.constants
 */

export const APP_NAME = 'SignalForge';
export const APP_TAGLINE = 'Intelligent Signals. Automated Execution. Smarter Trading.';
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const MAX_PAGE_SIZE = 200;

export const TOAST_DURATION_MS = 4000;
export const MODAL_ANIMATION_MS = 200;

export const SUPPORT_EMAIL = 'support@signalforge.ai';
export const SALES_EMAIL = 'sales@signalforge.ai';
export const SECURITY_EMAIL = 'security@signalforge.ai';

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/signalforge',
  linkedin: 'https://linkedin.com/company/signalforge',
  github: 'https://github.com/signalforge',
  discord: 'https://discord.gg/signalforge',
  telegram: 'https://t.me/signalforge',
};

export const ENVIRONMENT = import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development';

export const IS_DEVELOPMENT = ENVIRONMENT !== 'production';
export const IS_PRODUCTION = ENVIRONMENT === 'production';