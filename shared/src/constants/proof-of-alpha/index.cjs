'use strict';

const memoVersion = require('./memo-version.cjs');
const memoTypes = require('./memo-types.cjs');
const proofStatuses = require('./proof-statuses.cjs');
const leaderboardSort = require('./leaderboard-sort.cjs');
const verificationLevels = require('./verification-levels.cjs');

module.exports = {
  ...memoVersion,
  ...memoTypes,
  ...proofStatuses,
  ...leaderboardSort,
  ...verificationLevels,
};