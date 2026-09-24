/**
 * Source Slice
 *
 * Manages connected signal sources across all provider types
 * (Telegram, Discord, WhatsApp, TradingView, Email, REST API), along
 * with their discovered channels, monitored state, and processing
 * logs.
 *
 * @module client/src/store/slices/source
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sources: [],
  telegram: {
    connection: null,
    channels: [],
    pendingSession: null,
  },
  discord: {
    connection: null,
    guilds: [],
    channels: [],
  },
  whatsapp: {
    connection: null,
    groups: [],
  },
  tradingview: {
    integrations: [],
  },
  email: {
    connection: null,
  },
  restApi: {
    sources: [],
  },
  messages: [],
  isLoading: false,
  isSaving: false,
  error: null,
};

const sourceSlice = createSlice({
  name: 'source',
  initialState,
  reducers: {
    sourcesLoadRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    sourcesLoadSuccess(state, action) {
      state.isLoading = false;
      state.sources = Array.isArray(action.payload) ? action.payload : [];
      state.error = null;
    },
    sourcesLoadFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load sources';
    },
    sourceAddSuccess(state, action) {
      state.sources = [...state.sources, action.payload];
    },
    sourceRemoveSuccess(state, action) {
      state.sources = state.sources.filter((s) => s.sourceId !== action.payload);
    },
    telegramConnectionSet(state, action) {
      state.telegram.connection = action.payload || null;
    },
    telegramChannelsLoaded(state, action) {
      state.telegram.channels = Array.isArray(action.payload) ? action.payload : [];
    },
    telegramChannelToggled(state, action) {
      const { channelId, monitored } = action.payload || {};
      state.telegram.channels = state.telegram.channels.map((c) =>
        c.channelId === channelId ? { ...c, monitored } : c,
      );
    },
    telegramPendingSessionSet(state, action) {
      state.telegram.pendingSession = action.payload || null;
    },
    telegramSessionCleared(state) {
      state.telegram = initialState.telegram;
    },
    discordConnectionSet(state, action) {
      state.discord.connection = action.payload || null;
    },
    discordGuildsLoaded(state, action) {
      state.discord.guilds = Array.isArray(action.payload) ? action.payload : [];
    },
    discordChannelsLoaded(state, action) {
      state.discord.channels = Array.isArray(action.payload) ? action.payload : [];
    },
    whatsappConnectionSet(state, action) {
      state.whatsapp.connection = action.payload || null;
    },
    whatsappGroupsLoaded(state, action) {
      state.whatsapp.groups = Array.isArray(action.payload) ? action.payload : [];
    },
    tradingviewIntegrationsLoaded(state, action) {
      state.tradingview.integrations = Array.isArray(action.payload) ? action.payload : [];
    },
    emailConnectionSet(state, action) {
      state.email.connection = action.payload || null;
    },
    restApiSourcesLoaded(state, action) {
      state.restApi.sources = Array.isArray(action.payload) ? action.payload : [];
    },
    messagesLoaded(state, action) {
      state.messages = Array.isArray(action.payload) ? action.payload : [];
    },
    messageAdded(state, action) {
      state.messages = [action.payload, ...state.messages];
    },
    sourceReset() {
      return initialState;
    },
  },
});

export const {
  sourcesLoadRequest,
  sourcesLoadSuccess,
  sourcesLoadFailed,
  sourceAddSuccess,
  sourceRemoveSuccess,
  telegramConnectionSet,
  telegramChannelsLoaded,
  telegramChannelToggled,
  telegramPendingSessionSet,
  telegramSessionCleared,
  discordConnectionSet,
  discordGuildsLoaded,
  discordChannelsLoaded,
  whatsappConnectionSet,
  whatsappGroupsLoaded,
  tradingviewIntegrationsLoaded,
  emailConnectionSet,
  restApiSourcesLoaded,
  messagesLoaded,
  messageAdded,
  sourceReset,
} = sourceSlice.actions;

export default sourceSlice.reducer;