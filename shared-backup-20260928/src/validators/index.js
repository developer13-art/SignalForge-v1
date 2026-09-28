'use strict';

const email = require('./email.validator.js');
const phone = require('./phone.validator.js');
const password = require('./password.validator.js');
const username = require('./username.validator.js');
const symbol = require('./symbol.validator.js');
const timeframe = require('./timeframe.validator.js');
const price = require('./price.validator.js');
const lotSize = require('./lot-size.validator.js');
const walletAddress = require('./wallet-address.validator.js');
const txSignature = require('./tx-signature.validator.js');
const signalPayload = require('./signal-payload.validator.js');
const tradePayload = require('./trade-payload.validator.js');
const webhookPayload = require('./webhook-payload.validator.js');

module.exports = {
  ...email,
  ...phone,
  ...password,
  ...username,
  ...symbol,
  ...timeframe,
  ...price,
  ...lotSize,
  ...walletAddress,
  ...txSignature,
  ...signalPayload,
  ...tradePayload,
  ...webhookPayload,
};