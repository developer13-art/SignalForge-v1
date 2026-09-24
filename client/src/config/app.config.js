/**
 * Application Configuration
 *
 * General application-level constants: name, version, support links,
 * and default locale settings.
 *
 * @module client/src/config/app.config
 */

export const appConfig = Object.freeze({
  name: import.meta.env.VITE_APP_NAME || 'SignalForge',
  version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0',
  environment: import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development',
  publicUrl: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
  supportEmail: 'support@signalforge.ai',
  salesEmail: 'sales@signalforge.ai',
  securityEmail: 'security@signalforge.ai',
  social: {
    twitter: 'https://twitter.com/signalforge',
    linkedin: 'https://linkedin.com/company/signalforge',
    github: 'https://github.com/signalforge',
    discord: 'https://discord.gg/signalforge',
    telegram: 'https://t.me/signalforge',
  },
  defaults: {
    locale: 'en',
    currency: 'USD',
    timezone: 'UTC',
    theme: 'dark',
    pageSize: 20,
    toastDurationMs: 4000,
  },
  storage: {
    prefix: 'signalforge',
    accessTokenKey: 'signalforge.access_token',
    refreshTokenKey: 'signalforge.refresh_token',
    themeKey: 'signalforge.theme',
    localeKey: 'signalforge.locale',
    whiteLabelKey: 'signalforge.white_label',
    dismissedBannersKey: 'signalforge.dismissed_banners',
  },
});

export default appConfig;