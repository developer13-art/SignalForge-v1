import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Check, X } from 'lucide-react';
import Card from '../../common/Card';

const PlanComparison = forwardRef(function PlanComparison(
  {
    plans = [],
    features = [],
    onSelectPlan,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (plans.length === 0 || features.length === 0) {
    return null;
  }

  return (
    <Card ref={ref} padding="none" className={className} testId={testId} {...rest}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="sticky left-0 z-10 bg-white p-4 text-left text-sm font-semibold text-slate-500">
                Features
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.id || plan.name}
                  className="p-4 text-center text-sm font-semibold text-slate-900"
                >
                  <div>{plan.name}</div>
                  <div className="mt-1 text-xs font-normal text-slate-500">
                    {plan.currency || '$'}
                    {plan.price}/{plan.period || 'month'}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {features.map((feature, index) => (
              <tr
                key={feature.key || index}
                className={[
                  'border-b border-slate-100',
                  index % 2 === 1 ? 'bg-slate-50/50' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <td className="sticky left-0 z-10 bg-inherit p-4 text-sm font-medium text-slate-700">
                  {feature.label}
                  {feature.description ? (
                    <p className="mt-0.5 text-xs font-normal text-slate-500">
                      {feature.description}
                    </p>
                  ) : null}
                </td>

                {plans.map((plan) => {
                  const value = feature.values ? feature.values[plan.id || plan.name] : undefined;

                  return (
                    <td
                      key={`${plan.id || plan.name}-${feature.key || index}`}
                      className="p-4 text-center"
                    >
                      {value === true ? (
                        <Check size={16} className="mx-auto text-emerald-600" aria-hidden="true" />
                      ) : value === false ? (
                        <X size={16} className="mx-auto text-slate-300" aria-hidden="true" />
                      ) : value !== undefined ? (
                        <span className="text-sm font-medium text-slate-700">{value}</span>
                      ) : (
                        <X size={16} className="mx-auto text-slate-300" aria-hidden="true" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr>
              <td className="sticky left-0 z-10 bg-white p-4" />
              {plans.map((plan) => (
                <td key={`cta-${plan.id || plan.name}`} className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => onSelectPlan && onSelectPlan(plan)}
                    className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    Choose
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
});

PlanComparison.propTypes = {
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      period: PropTypes.string,
      currency: PropTypes.string,
    })
  ),
  features: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.node,
      description: PropTypes.node,
      values: PropTypes.object,
    })
  ),
  onSelectPlan: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default PlanComparison;