/**
 * Application Error Boundary
 *
 * Catches render-time errors in the component tree and renders a
 * branded fallback with a retry action. In development, the full
 * stack trace is exposed.
 *
 * @module client/src/app/ErrorBoundary
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.MODE !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info);
    }
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children || null;
    }

    const showDetails = import.meta.env.MODE !== 'production' && this.state.error;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-lg w-full rounded-2xl border border-surface-border bg-surface p-8 shadow-modal">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-subtle text-error">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-h4 font-semibold text-text-primary">Something went wrong</h1>
              <p className="text-small text-text-secondary">
                An unexpected error occurred while rendering this view.
              </p>
            </div>
          </div>

          {showDetails ? (
            <pre className="mt-5 max-h-64 overflow-auto rounded-lg border border-surface-border bg-background-subtle p-4 text-caption text-text-secondary">
              {String(this.state.error && this.state.error.stack ? this.state.error.stack : this.state.error)}
            </pre>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-small font-medium text-white transition hover:bg-primary-600"
            >
              <RefreshCcw className="h-4 w-4" />
              Try again
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-small font-medium text-text-secondary transition hover:border-primary-500 hover:text-text-primary"
            >
              Go to home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}