/**
 * KycBanner
 *
 * Persistent banner rendered on gated pages when the authenticated
 * user has not completed KYC verification. Matches the "KYC
 * Verification Required" banner shown in the mockups.
 *
 * @module client/src/layouts/components/KycBanner
 */

import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';

import { selectCurrentUser } from '../../store/selectors/auth.selectors.js';
import { selectDismissedBanners, dismissBanner } from '../../store/slices/ui.slice.js';
import { cn } from '../../lib/utils/cn.util.js';

const BANNER_KEY = 'kyc-verification-required';

export default function KycBanner({ className }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const dismissed = useSelector(selectDismissedBanners);

  const kycStatus = currentUser?.kycStatus || 'NOT_STARTED';

  if (kycStatus === 'VERIFIED' || dismissed[BANNER_KEY]) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border border-warning-border bg-warning-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <p className="text-small font-semibold text-text-primary">KYC Verification Required</p>
          <p className="text-caption text-text-secondary">
            Complete your KYC to unlock all platform features.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to="/kyc"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3 py-1.5 text-caption font-semibold text-white shadow-glow-primary transition-opacity hover:opacity-90"
        >
          Complete KYC
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => dispatch(dismissBanner(BANNER_KEY))}
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}