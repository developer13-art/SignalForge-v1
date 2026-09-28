'use strict';

const jupiterGateway = require('./jupiter.gateway');
const jupiterConstants = require('./jupiter.constants');
const jupiterErrors = require('./jupiter.errors');
const jupiterClient = require('./jupiter-client.service');
const jupiterQuoteService = require('./jupiter-quote.service');
const jupiterSwapService = require('./jupiter-transaction.service');
const jupiterSlippageService = require('./jupiter-slippage.service');
const jupiterFeeService = require('./jupiter-fee.service');
const jupiterRouteService = require('./jupiter-route.service');
const jupiterTokenService = require('./jupiter-token.service');
const jupiterRepository = require('./jupiter.repository');
const jupiterConfirmationService = require('./jupiter-confirmation.service');

module.exports = {
  gateway: jupiterGateway,
  constants: jupiterConstants,
  errors: jupiterErrors,
  client: jupiterClient,
  quote: jupiterQuoteService,
  swap: jupiterSwapService,
  slippage: jupiterSlippageService,
  fee: jupiterFeeService,
  route: jupiterRouteService,
  token: jupiterTokenService,
  repository: jupiterRepository,
  confirmation: jupiterConfirmationService,
};