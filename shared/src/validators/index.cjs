'use strict';

const email = require('./email.validator.cjs');
const phone = require('./phone.validator.cjs');
const password = require('./password.validator.cjs');
const username = require('./username.validator.cjs');
const symbol = require('./symbol.validator.cjs');
const timeframe = require('./timeframe.validator.cjs');
const price = require('./price.validator.cjs');
const lotSize = require('./lot-size.validator.cjs');
const walletAddress = require('./wallet-address.validator.cjs');
const txSignature = require('./tx-signature.validator.cjs');
const signalPayload = require('./signal-payload.validator.cjs');
const tradePayload = require('./trade-payload.validator.cjs');
const webhookPayload = require('./webhook-payload.validator.cjs');

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
