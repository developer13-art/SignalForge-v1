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
 * Composes the entire provider tree the application relies on. The
 * ordering is deliberate:
 *
 *   1. Redux store
 *   2. React Query client
 *   3. Theme (needs to be first so that children can read the theme)
 *   4. Auth (needs Redux)
 *   5. User (needs Auth)
 *   6. Notification (needs User)
 *   7. WhiteLabel (branding overrides; needs to be before Wallet)
 *   8. Wallet (generic wallet provider; used by Auth upgrades)
 *   9. Solana (specific to on-chain features; needs Wallet)
 *  10. Toast notifications (mounted last so all contexts can emit)
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