import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import store from './store';
import queryClient from './queryClient';
import { AuthProvider } from '../context/AuthContext';
import { UserProvider } from '../context/UserContext';
import { ThemeProvider } from '../context/ThemeContext';
import { NotificationProvider } from '../context/NotificationContext';
import { WalletProvider } from '../context/WalletContext';
import { SolanaProvider } from '../context/SolanaContext';
import { WhiteLabelProvider } from '../context/WhiteLabelContext';

/**
 * SignalForge - Application Providers
 *
 * The ordering below is deliberate and load-bearing:
 *
 *   1. Redux store
 *   2. React Query client
 *   3. Theme (everything reads theme)
 *   4. Auth (needs Redux)
 *   5. User (needs Auth)
 *   6. Notification (needs User)
 *   7. WhiteLabel (branding; independent)
 *   8. Wallet (must be an ANCESTOR of Solana because Solana
 *      reads wallet-adapter state)
 *   9. Solana (needs Wallet)
 *  10. Toaster (last; can consume every context above)
 */
export default function AppProviders({ children }) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <NotificationProvider>
                <WhiteLabelProvider>
                  <WalletProvider>
                    <SolanaProvider>
                      {children}
                      <Toaster position="top-right" richColors closeButton />
                    </SolanaProvider>
                  </WalletProvider>
                </WhiteLabelProvider>
              </NotificationProvider>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}