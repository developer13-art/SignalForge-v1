import React from 'react';
import PropTypes from 'prop-types';
import { CreditCard, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import SubscriptionStatusBadge from '../../components/domain/subscription/SubscriptionStatusBadge';

const SubscriptionStatusWidget = function SubscriptionStatusWidget({ subscription, onManage }) {
  if (!subscription) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <CreditCard size={18} aria-hidden="true" />
            </span>
            <div>
              <Heading level={3} size="text-base">
                Subscription
              </Heading>
              <Text color="muted" className="text-xs">
                No active subscription
              </Text>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              window.location.href = '/pricing';
            }}
          >
            View Plans
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <CreditCard size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              Subscription
            </Heading>
            <Text color="muted" className="text-xs">
              {subscription.planName}
            </Text>
          </div>
        </div>

        <SubscriptionStatusBadge status={subscription.status} size="sm" />
      </div>

      <div className="mt-4 space-y-2 text-xs">
        {subscription.renewsAt ? (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Renews</span>
            <span className="font-medium text-slate-800">{subscription.renewsAt}</span>
          </div>
        ) : null}
        {subscription.daysRemaining !== undefined ? (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Days remaining</span>
            <span className="font-medium text-slate-800">{subscription.daysRemaining}</span>
          </div>
        ) : null}
        {subscription.price ? (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Amount</span>
            <span className="font-medium text-slate-800">{subscription.price}</span>
          </div>
        ) : null}
      </div>

      {onManage ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onManage}
            trailingIcon={ArrowRight}
          >
            Manage Subscription
          </Button>
        </div>
      ) : null}
    </Card>
  );
};

SubscriptionStatusWidget.propTypes = {
  subscription: PropTypes.shape({
    planName: PropTypes.string,
    status: PropTypes.string,
    renewsAt: PropTypes.string,
    daysRemaining: PropTypes.number,
    price: PropTypes.string,
  }),
  onManage: PropTypes.func,
};

export default SubscriptionStatusWidget;