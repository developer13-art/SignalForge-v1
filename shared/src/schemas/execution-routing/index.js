'use strict';

const routeDecision = require('./route-decision.schema');
const instrumentClass = require('./instrument-class.schema');
const dexOrder = require('./dex-order.schema');
const dexSwap = require('./dex-swap.schema');
const routePolicy = require('./route-policy.schema');
const cryptoPosition = require('./crypto-position.schema');

module.exports = {
  ...routeDecision,
  ...instrumentClass,
  ...dexOrder,
  ...dexSwap,
  ...routePolicy,
  ...cryptoPosition,
};