'use strict';

const memoVersion = require('./memo-version');
const memoTypes = require('./memo-types');
const proofStatuses = require('./proof-statuses');
const leaderboardSort = require('./leaderboard-sort');
const verificationLevels = require('./verification-levels');

module.exports = {
  ...memoVersion,
  ...memoTypes,
  ...proofStatuses,
  ...leaderboardSort,
  ...verificationLevels,
};