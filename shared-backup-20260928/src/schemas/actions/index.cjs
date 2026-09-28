'use strict';

const blinkMetadata = require('./blink-metadata.schema.cjs');
const actionGetResponse = require('./action-get-response.schema.cjs');
const actionPostRequest = require('./action-post-request.schema.cjs');
const actionPostResponse = require('./action-post-response.schema.cjs');
const actionConfirmation = require('./action-confirmation.schema.cjs');
const blinkAnalytics = require('./blink-analytics.schema.cjs');

module.exports = {
  ...blinkMetadata,
  ...actionGetResponse,
  ...actionPostRequest,
  ...actionPostResponse,
  ...actionConfirmation,
  ...blinkAnalytics,
};