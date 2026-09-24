/**
 * Not Found Route
 *
 * Fallback page for unmatched routes. Renders the branded empty state
 * and offers a way back to the dashboard or public home.
 *
 * @module client/src/routes/NotFoundRoute
 */

import { Link } from 'react-router-dom';
import { Home, LayoutDashboard } from 'lucide-react';

import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/selectors/auth.selectors.js';

export default function NotFoundRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md w-full rounded-2xl border border-surface-border bg-surface p-8 text-center">
        <p className="text-caption font-semibold uppercase tracking-widest text-text-tertiary">Error 404</p>
        <h1 className="mt-2 text-h2 font-semibold text-text-primary">Page not found</h1>
        <p className="mt-3 text-small text-text-secondary">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-surface-border px-4 py-2.5 text-small font-medium text-text-secondary transition hover:border-primary-500 hover:text-text-primary"
          >
            <Home className="h-4 w-4" />
            Public home
          </Link>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-small font-medium text-white transition hover:bg-primary-600"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-small font-medium text-white transition hover:bg-primary-600"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}