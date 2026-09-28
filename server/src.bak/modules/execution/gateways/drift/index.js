'use strict';

const driftGateway = require('./drift.gateway');
const driftConstants = require('./drift.constants');
const driftErrors = require('./drift.errors');
const driftClient = require('./drift-client.service');
const driftMarginService = require('./drift-margin.service');
const driftOrderService = require('./drift-order.service');
const driftPositionService = require('./drift-position.service');
const driftRepository = require('./drift.repository');

module.exports = {
  gateway: driftGateway,
  constants: driftConstants,
  errors: driftErrors,
  client: driftClient,
  margin: driftMarginService,
  order: driftOrderService,
  position: driftPositionService,
  repository: driftRepository,
};