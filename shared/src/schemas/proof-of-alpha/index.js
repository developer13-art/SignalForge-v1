'use strict';

const memoPayload = require('./memo-payload.schema');
const proofRecord = require('./proof-record.schema');
const proofVerification = require('./proof-verification.schema');
const leaderboardEntry = require('./leaderboard-entry.schema');
const proofQuery = require('./proof-query.schema');

module.exports = {
  ...memoPayload,
  ...proofRecord,
  ...proofVerification,
  ...leaderboardEntry,
  ...proofQuery,
};