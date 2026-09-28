'use strict';

import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './slices/auth.slice';
import userReducer from './slices/user.slice';
import kycReducer from './slices/kyc.slice';
import sourceReducer from './slices/source.slice';
import signalReducer from './slices/signal.slice';
import tradeReducer from './slices/trade.slice';
import brokerReducer from './slices/broker.slice';
import riskReducer from './slices/risk.slice';
import automationReducer from './slices/automation.slice';
import analyticsReducer from './slices/analytics.slice';
import subscriptionReducer from './slices/subscription.slice';
import paymentReducer from './slices/payment.slice';
import walletReducer from './slices/wallet.slice';
import referralReducer from './slices/referral.slice';
import providerReducer from './slices/provider.slice';
import marketplaceReducer from './slices/marketplace.slice';
import notificationReducer from './slices/notification.slice';
import uiReducer from './slices/ui.slice';

// Feature A — Solana Actions & Blinks
import solanaBlinkReducer from './slices/solana-blink.slice';

// Feature B — Proof of Alpha
import proofOfAlphaReducer from './slices/proof-of-alpha.slice';

// Feature C — Hybrid Execution Engine
import cryptoTradingReducer from './slices/crypto-trading.slice';
import executionRouterReducer from './slices/execution-router.slice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  kyc: kycReducer,
  source: sourceReducer,
  signal: signalReducer,
  trade: tradeReducer,
  broker: brokerReducer,
  risk: riskReducer,
  automation: automationReducer,
  analytics: analyticsReducer,
  subscription: subscriptionReducer,
  payment: paymentReducer,
  wallet: walletReducer,
  referral: referralReducer,
  provider: providerReducer,
  marketplace: marketplaceReducer,
  notification: notificationReducer,
  ui: uiReducer,

  // Feature A
  solanaBlink: solanaBlinkReducer,

  // Feature B
  proofOfAlpha: proofOfAlphaReducer,

  // Feature C
  cryptoTrading: cryptoTradingReducer,
  executionRouter: executionRouterReducer,
});

export default rootReducer;