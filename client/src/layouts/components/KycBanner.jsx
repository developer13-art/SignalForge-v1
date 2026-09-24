/**
 * KycBanner
 *
 * Persistent banner prompting the user to complete KYC. It renders
 * only when the user's KYC status is not VERIFIED. The CTA jumps
 * straight to the next KYC step.
 *
 * @module client/src/layouts/components/KycBanner
 */

import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

import { routes } from '@config/routes.config.js';
import { appConfig } from '@config/app.config.js';

export default function KycBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(appConfig.storage.dismissedBannersKey) === 'kyc';
    } catch (err) {
      return false;
    }
  });

  const kycStatus = useSelector((state) => state.kyc.status) || 'NOT_STARTED';

  if (kycStatus === 'VERIFIED' || dismissed) {
    return null;
  }

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(appConfig.storage.dismissedBannersKey, 'kyc');
    } catch (err) {
      // ignore
    }
  }

  const ctaLabel = kycStatus === 'NOT_STARTED' ? 'Complete KYC' : 'Continue KYC';
  const ctaTo = kycStatus === 'NOT_STARTED' ? routes.kyc.intro : routes.kyc.statusDashboard;

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div>
          <p className="text-small font-semibold text-text-primary">KYC Verification Required</p>
          <p className="text-caption text-text-secondary">
            Complete your KYC to unlock all platform features.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to={ctaTo}
          className="inline-flex items-center gap-2 rounded-lg bg-warning px-4 py-2 text-caption font-semibold text-background transition hover:opacity-90"
        >
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition hover:text-text-primary"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}