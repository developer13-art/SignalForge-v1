'use strict';

const hyperliquidGateway = require('./hyperliquid.gateway');
const hyperliquidConstants = require('./hyperliquid.constants');
const hyperliquidErrors = require('./hyperliquid.errors');
const hyperliquidClient = require('./hyperliquid-client.service');
const hyperliquidMarketService = require('./hyperliquid-market.service');
const hyperliquidOrderService = require('./hyperliquid-order.service');
const hyperliquidPositionService = require('./hyperliquid-position.service');
const hyperliquidRepository = require('./hyperliquid.repository');
const hyperliquidWsService = require('./hyperliquid-ws.service');

module.exports = {
  gateway: hyperliquidGateway,
  constants: hyperliquidConstants,
  errors: hyperliquidErrors,
  client: hyperliquidClient,
  market: hyperliquidMarketService,
  order: hyperliquidOrderService,
  position: hyperliquidPositionService,
  repository: hyperliquidRepository,
  websocket: hyperliquidWsService,
};