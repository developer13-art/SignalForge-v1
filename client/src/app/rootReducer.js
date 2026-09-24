/**
 * Root Reducer
 *
 * Combines every domain slice into a single reducer. Slices are
 * imported in a stable order so that state shape does not change
 * between builds.
 *
 * @module client/src/app/rootReducer
 */

import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '../store/slices/auth.slice.js';
import userReducer from '../store/slices/user.slice.js';
import kycReducer from '../store/slices/kyc.slice.js';
import sourceReducer from '../store/slices/source.slice.js';
import signalReducer from '../store/slices/signal.slice.js';
import tradeReducer from '../store/slices/trade.slice.js';
import brokerReducer from '../store/slices/broker.slice.js';
import riskReducer from '../store/slices/risk.slice.js';
import automationReducer from '../store/slices/automation.slice.js';
import analyticsReducer from '../store/slices/analytics.slice.js';
import subscriptionReducer from '../store/slices/subscription.slice.js';
import paymentReducer from '../store/slices/payment.slice.js';
import walletReducer from '../store/slices/wallet.slice.js';
import referralReducer from '../store/slices/referral.slice.js';
import providerReducer from '../store/slices/provider.slice.js';
import marketplaceReducer from '../store/slices/marketplace.slice.js';
import notificationReducer from '../store/slices/notification.slice.js';
import solanaReducer from '../store/slices/solana.slice.js';
import uiReducer from '../store/slices/ui.slice.js';

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
  solana: solanaReducer,
  ui: uiReducer,
});

export default rootReducer;