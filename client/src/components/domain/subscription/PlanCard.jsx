import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Check, Zap } from 'lucide-react';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

const PlanCard = forwardRef(function PlanCard(
  {
    plan,
    featured = false,
    current = false,
    onSelect,
    onManage,
    ctaLabel,
    manageLabel = 'Manage Plan',
    showFeatures = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!plan) {
    return null;
  }

  const {
    name,
    description,
    price,
    yearlyPrice,
    period = 'month',
    currency = '$',
    features = [],
    savings,
    badge,
  } = plan;

  return (
    <Card
      ref={ref}
      padding="lg"
      variant={featured ? 'elevated' : 'default'}
      className={[
        'relative flex flex-col',
        featured ? 'ring-2 ring-indigo-500' : '',
        current ? 'ring-2 ring-emerald-500' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      testId={testId}
      {...rest}
    >
      {featured && !current ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="primary" size="sm">
            Recommended
          </Badge>
        </div>
      ) : null}

      {current ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="success" size="sm">
            Current Plan
          </Badge>
        </div>
      ) : null}

      {badge ? (
        <div className="mb-3">
          <Badge variant="neutral" size="sm">
            {badge}
          </Badge>
        </div>
      ) : null}

      <div>
        <h3 className="text-lg font-bold text-slate-900">{name}</h3>
        {description ? (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        ) : null}
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-900">
          {currency}
          {price}
        </span>
        <span className="text-sm font-medium text-slate-500">/{period}</span>
      </div>

      {yearlyPrice ? (
        <p className="mt-1 text-xs text-slate-500">
          or {currency}
          {yearlyPrice}/year
          {savings ? <span className="ml-1 font-semibold text-emerald-600">{savings}</span> : null}
        </p>
      ) : null}

      {showFeatures && features.length > 0 ? (
        <ul className="mt-6 flex-1 space-y-2.5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
              <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-6">
        {current ? (
          <Button variant="outline" onClick={onManage} className="w-full">
            {manageLabel}
          </Button>
        ) : (
          <Button
            variant={featured ? 'primary' : 'outline'}
            onClick={onSelect}
            leadingIcon={featured ? Zap : undefined}
            className="w-full"
          >
            {ctaLabel || 'Choose Plan'}
          </Button>
        )}
      </div>
    </Card>
  );
});

PlanCard.propTypes = {
  plan: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    yearlyPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    period: PropTypes.string,
    currency: PropTypes.string,
    features: PropTypes.arrayOf(PropTypes.string),
    savings: PropTypes.string,
    badge: PropTypes.string,
  }),
  featured: PropTypes.bool,
  current: PropTypes.bool,
  onSelect: PropTypes.func,
  onManage: PropTypes.func,
  ctaLabel: PropTypes.string,
  manageLabel: PropTypes.string,
  showFeatures: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default PlanCard;