'use strict';

const memoPayload = require('./memo-payload.schema.cjs');
const proofRecord = require('./proof-record.schema.cjs');
const proofVerification = require('./proof-verification.schema.cjs');
const leaderboardEntry = require('./leaderboard-entry.schema.cjs');
const proofQuery = require('./proof-query.schema.cjs');

module.exports = {
  ...memoPayload,
  ...proofRecord,
  ...proofVerification,
  ...leaderboardEntry,
  ...proofQuery,
};