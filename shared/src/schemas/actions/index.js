'use strict';

const blinkMetadata = require('./blink-metadata.schema');
const actionGetResponse = require('./action-get-response.schema');
const actionPostRequest = require('./action-post-request.schema');
const actionPostResponse = require('./action-post-response.schema');
const actionConfirmation = require('./action-confirmation.schema');
const blinkAnalytics = require('./blink-analytics.schema');

module.exports = {
  ...blinkMetadata,
  ...actionGetResponse,
  ...actionPostRequest,
  ...actionPostResponse,
  ...actionConfirmation,
  ...blinkAnalytics,
};