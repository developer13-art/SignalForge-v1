/**
 * KYC Required Route
 *
 * Guards routes that require the user's identity to be VERIFIED.
 * Renders an inline prompt that routes to the KYC flow instead of
 * silently redirecting, matching the platform's contextual KYC
 * approach.
 *
 * @module client/src/routes/KycRequiredRoute
 */

import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldCheck, ArrowRight } from 'lucide-react';

import { selectCurrentUser } from '../store/selectors/auth.selectors.js';

const VERIFIED_STATUS = 'VERIFIED';

export default function KycRequiredRoute() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const kycStatus = user ? user.kycStatus : null;

  if (kycStatus === VERIFIED_STATUS) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-warning-border bg-warning-subtle p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-warning/20 text-warning">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-h4 font-semibold text-text-primary">Identity verification required</h2>
            <p className="mt-2 text-small text-text-secondary">
              This feature is only available once your identity has been verified. Complete KYC to unlock it.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/kyc')}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-small font-medium text-white transition hover:bg-primary-600"
        >
          Complete KYC
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}