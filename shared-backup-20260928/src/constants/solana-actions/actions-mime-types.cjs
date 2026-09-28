'use strict';

/**
 * SignalForge - Solana Actions MIME Type Constants
 */

const MIME_TYPES = Object.freeze({
  JSON: 'application/json',
  JSON_UTF8: 'application/json; charset=utf-8',
  TEXT: 'text/plain',
  HTML: 'text/html',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  SVG: 'image/svg+xml',
  WEBP: 'image/webp',
});

const ACTIONS_SUPPORTED_CONTENT_TYPES = Object.freeze([
  MIME_TYPES.JSON,
  MIME_TYPES.JSON_UTF8,
]);

const ACTIONS_ICON_CONTENT_TYPES = Object.freeze([
  MIME_TYPES.PNG,
  MIME_TYPES.JPEG,
  MIME_TYPES.SVG,
  MIME_TYPES.WEBP,
]);

const ACTIONS_REQUIRED_ICON_CONTENT_TYPE = MIME_TYPES.PNG;

module.exports = Object.freeze({
  MIME_TYPES,
  ACTIONS_SUPPORTED_CONTENT_TYPES,
  ACTIONS_ICON_CONTENT_TYPES,
  ACTIONS_REQUIRED_ICON_CONTENT_TYPE,
});