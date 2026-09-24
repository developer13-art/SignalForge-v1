/**
 * Application Router Factory
 *
 * Creates the application router instance. Kept separate from
 * `App.jsx` so that the router can be reused in tests without the
 * full provider tree.
 *
 * @module client/src/app/router
 */

import { createBrowserRouter } from 'react-router-dom';

import AppRouter from '../routes/index.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

export function createAppRouter() {
  return createBrowserRouter([
    {
      path: '*',
      element: <AppRouter />,
      errorElement: <ErrorBoundary />,
    },
  ]);
}

export default createAppRouter;