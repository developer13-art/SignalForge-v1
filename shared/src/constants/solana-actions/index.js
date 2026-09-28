'use strict';

const actionsTypes = require('./actions-types');
const actionsHeaders = require('./actions-headers');
const actionsMimeTypes = require('./actions-mime-types');
const actionsErrors = require('./actions-errors');
const blinkTemplates = require('./blink-templates');
const supportedTokens = require('./supported-tokens');

module.exports = {
  ...actionsTypes,
  ...actionsHeaders,
  ...actionsMimeTypes,
  ...actionsErrors,
  ...blinkTemplates,
  ...supportedTokens,
};