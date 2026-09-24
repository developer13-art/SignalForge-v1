/**
 * Auth Layout
 *
 * Minimal layout for authentication screens: centered card, branded
 * background glow, logo at the top, and a link back to the marketing
 * site.
 *
 * @module client/src/layouts/AuthLayout
 */

import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-text-primary overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(60% 55% at 50% 0%, rgba(99, 102, 241, 0.15) 0%, rgba(10, 14, 26, 0) 60%), radial-gradient(50% 50% at 100% 100%, rgba(139, 92, 246, 0.12) 0%, rgba(10, 14, 26, 0) 60%)',
        }}
      />

      <div className="relative z-10 flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/assets/logo.svg" alt="SignalForge" className="h-8 w-8" />
          <span className="text-h5 font-bold tracking-tight">
            SignalForge<span className="text-primary-400"> AI</span>
          </span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-small font-medium text-text-secondary transition hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      <footer className="relative z-10 px-4 pb-6 text-center text-caption text-text-tertiary sm:px-6">
        <p>© {new Date().getFullYear()} SignalForge AI. All rights reserved.</p>
      </footer>
    </div>
  );
}