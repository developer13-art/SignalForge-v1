import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Check, CreditCard, Calendar, Zap, Users } from 'lucide-react';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

const ProviderSubscriptionCard = forwardRef(function ProviderSubscriptionCard(
  {
    plan,
    active = false,
    subscribed = false,
    onSubscribe,
    onManage,
    onCancel,
    showFeatures = true,
    featured = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!plan) {
    return null;
  }

  const { name, price, period, currency = '$', features = [], description, subscriberCount } = plan;

  return (
    <Card
      ref={ref}
      padding="lg"
      variant={featured ? 'elevated' : 'default'}
      className={[
        featured ? 'ring-2 ring-indigo-500' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      testId={testId}
      {...rest}
    >
      {featured ? (
        <div className="mb-3">
          <Badge variant="primary" size="sm">
            Recommended
          </Badge>
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{name}</h3>
          {description ? (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          ) : null}
        </div>
        {subscribed ? (
          <Badge variant={active ? 'success' : 'warning'} size="sm">
            {active ? 'Active' : 'Pending'}
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-900">
          {currency}
          {price}
        </span>
        <span className="text-sm font-medium text-slate-500">/{period}</span>
      </div>

      {subscriberCount !== undefined ? (
        <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <Users size={12} aria-hidden="true" />
          {subscriberCount} active subscribers
        </p>
      ) : null}

      {showFeatures && features.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
              <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6">
        {subscribed ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onManage} className="flex-1">
              Manage
            </Button>
            {onCancel ? (
              <Button variant="ghost" onClick={onCancel} className="text-rose-600">
                Cancel
              </Button>
            ) : null}
          </div>
        ) : (
          <Button
            variant={featured ? 'primary' : 'outline'}
            onClick={onSubscribe}
            leadingIcon={Zap}
            className="w-full"
          >
            Subscribe Now
          </Button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <CreditCard size={10} aria-hidden="true" />
          Secure payment
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={10} aria-hidden="true" />
          Cancel anytime
        </span>
      </div>
    </Card>
  );
});

ProviderSubscriptionCard.propTypes = {
  plan: PropTypes.shape({
    name: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    period: PropTypes.string,
    currency: PropTypes.string,
    features: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    subscriberCount: PropTypes.number,
  }),
  active: PropTypes.bool,
  subscribed: PropTypes.bool,
  onSubscribe: PropTypes.func,
  onManage: PropTypes.func,
  onCancel: PropTypes.func,
  showFeatures: PropTypes.bool,
  featured: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ProviderSubscriptionCard;