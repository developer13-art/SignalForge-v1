'use strict';

const orcaGateway = require('./orca.gateway');
const orcaConstants = require('./orca.constants');
const orcaErrors = require('./orca.errors');
const orcaClient = require('./orca-client.service');
const orcaPoolService = require('./orca-pool.service');
const orcaQuoteService = require('./orca-quote.service');
const orcaSwapService = require('./orca-swap.service');
const orcaRepository = require('./orca.repository');
const orcaTokenService = require('./orca-token.service');
const orcaConfirmationService = require('./orca-confirmation.service');

module.exports = {
  gateway: orcaGateway,
  constants: orcaConstants,
  errors: orcaErrors,
  client: orcaClient,
  pool: orcaPoolService,
  quote: orcaQuoteService,
  swap: orcaSwapService,
  repository: orcaRepository,
  token: orcaTokenService,
  confirmation: orcaConfirmationService,
};