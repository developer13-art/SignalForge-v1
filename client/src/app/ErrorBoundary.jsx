import React from 'react';

/**
 * Error Boundary
 *
 * Catches render-time errors in the React tree and displays a fallback
 * UI. Because this component sits above the router in the tree, it
 * must not use router-aware components such as <Link>. Plain anchors
 * are used instead so that the boundary can always render.
 *
 * @module client/src/app/ErrorBoundary
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (typeof console !== 'undefined') {
      console.error('Uncaught error in React tree:', error, info);
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const message =
      this.state.error && this.state.error.message
        ? this.state.error.message
        : 'An unexpected error occurred.';

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-8 shadow-elevated">
          <h1 className="text-h4 font-semibold text-text-primary">
            Something went wrong
          </h1>
          <p className="mt-2 text-small text-text-secondary">
            {message}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-4 py-2 text-small font-semibold text-white shadow-glow-primary transition hover:opacity-90"
            >
              Reload the page
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-surface-border px-4 py-2 text-small font-medium text-text-secondary transition hover:text-text-primary"
            >
              Go to homepage
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;