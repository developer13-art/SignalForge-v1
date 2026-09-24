/**
 * Application Root
 *
 * Composes all top-level providers (Redux, React Query, Theme, Auth,
 * Notifications, Wallet, Solana, White Label) and renders the router.
 * Ordering matters: providers that other providers depend on must be
 * declared first.
 *
 * @module client/src/App
 */

import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { store } from './app/store.js';
import { queryClient } from './app/queryClient.js';

import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { WalletProvider } from './context/WalletContext.jsx';
import { SolanaProvider } from './context/SolanaContext.jsx';
import { WhiteLabelProvider } from './context/WhiteLabelContext.jsx';

import AppRouter from './routes/index.jsx';
import ErrorBoundary from './app/ErrorBoundary.jsx';
import ToastContainer from './components/feedback/ToastContainer.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <ThemeProvider>
              <WhiteLabelProvider>
                <AuthProvider>
                  <UserProvider>
                    <WalletProvider>
                      <SolanaProvider>
                        <NotificationProvider>
                          <BrowserRouter>
                            <AppRouter />
                            <ToastContainer />
                          </BrowserRouter>
                        </NotificationProvider>
                      </SolanaProvider>
                    </WalletProvider>
                  </UserProvider>
                </AuthProvider>
              </WhiteLabelProvider>
            </ThemeProvider>
          </HelmetProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}