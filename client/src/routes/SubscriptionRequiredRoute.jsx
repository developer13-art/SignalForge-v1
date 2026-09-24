/**
 * Subscription Required Route
 *
 * Guards routes that require an active or trial subscription. On
 * failure, shows a clean upgrade prompt rather than a silent redirect.
 *
 * @module client/src/routes/SubscriptionRequiredRoute
 */

import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Sparkles, ArrowRight } from 'lucide-react';

import { selectSubscription } from '../store/slices/subscription.slice.js';

const ALLOWED_STATUSES = ['TRIAL', 'ACTIVE'];

export default function SubscriptionRequiredRoute() {
  const navigate = useNavigate();
  const subscription = useSelector(selectSubscription);

  const status = subscription ? subscription.status : null;

  if (status && ALLOWED_STATUSES.includes(status)) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-h4 font-semibold text-text-primary">Subscription required</h2>
            <p className="mt-2 text-small text-text-secondary">
              Activate a subscription to unlock this feature and start automated trading.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/subscriptions/plans')}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-small font-medium text-white transition hover:bg-primary-600"
        >
          View plans
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}