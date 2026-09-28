'use strict';

const actionsTypes = require('./actions-types.cjs');
const actionsHeaders = require('./actions-headers.cjs');
const actionsMimeTypes = require('./actions-mime-types.cjs');
const actionsErrors = require('./actions-errors.cjs');
const blinkTemplates = require('./blink-templates.cjs');
const supportedTokens = require('./supported-tokens.cjs');

module.exports = {
  ...actionsTypes,
  ...actionsHeaders,
  ...actionsMimeTypes,
  ...actionsErrors,
  ...blinkTemplates,
  ...supportedTokens,
};