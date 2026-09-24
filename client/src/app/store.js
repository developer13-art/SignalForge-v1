/**
 * Redux Store
 *
 * Central Redux store. Combines all domain reducers through the root
 * reducer and applies a small set of middleware. Persistence and
 * devtools are only enabled outside of production.
 *
 * @module client/src/app/store
 */

import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer.js';

const isDevelopment = import.meta.env.MODE !== 'production';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['solana.connection', 'solana.wallet'],
      },
      immutableCheck: isDevelopment ? { warnAfter: 128 } : false,
    }),
  devTools: isDevelopment,
});

export default store;