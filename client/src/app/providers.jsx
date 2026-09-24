/**
 * Provider Composer
 *
 * Exposes a single component that wraps children with every top-level
 * provider required by the app. Used by tests and by the root `App`
 * to avoid repeating the provider tree.
 *
 * @module client/src/app/providers
 */

import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { store } from './store.js';
import { queryClient } from './queryClient.js';

import { ThemeProvider } from '../context/ThemeContext.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { UserProvider } from '../context/UserContext.jsx';
import { NotificationProvider } from '../context/NotificationContext.jsx';
import { WalletProvider } from '../context/WalletContext.jsx';
import { SolanaProvider } from '../context/SolanaContext.jsx';
import { WhiteLabelProvider } from '../context/WhiteLabelContext.jsx';

export default function AppProviders({ children, withRouter = true }) {
  const content = (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider>
            <WhiteLabelProvider>
              <AuthProvider>
                <UserProvider>
                  <WalletProvider>
                    <SolanaProvider>
                      <NotificationProvider>{children}</NotificationProvider>
                    </SolanaProvider>
                  </WalletProvider>
                </UserProvider>
              </AuthProvider>
            </WhiteLabelProvider>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );

  if (!withRouter) {
    return content;
  }

  return <BrowserRouter>{content}</BrowserRouter>;
}