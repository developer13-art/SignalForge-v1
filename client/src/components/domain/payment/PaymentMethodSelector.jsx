import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { CreditCard, Wallet, Coins, Building2 } from 'lucide-react';

const ICONS = {
  card: CreditCard,
  stripe: CreditCard,
  paystack: Building2,
  flutterwave: Building2,
  solana: Coins,
  crypto: Coins,
  wallet: Wallet,
};

const PaymentMethodSelector = forwardRef(function PaymentMethodSelector(
  {
    methods = [],
    value,
    onChange,
    columns = 1,
    disabled = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      role="radiogroup"
      className={[
        'grid gap-3',
        columns === 2 ? 'sm:grid-cols-2' : '',
        columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {methods.map((method) => {
        const Icon = ICONS[method.id] || ICONS[method.type] || CreditCard;
        const isSelected = method.id === value;

        return (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled || method.disabled}
            onClick={() => onChange && onChange(method.id, method)}
            className={[
              'flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors',
              isSelected
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
              disabled || method.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span
              className={[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
                isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Icon size={18} aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{method.label}</p>
                <span
                  className={[
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                    isSelected ? 'border-indigo-600' : 'border-slate-300',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                >
                  {isSelected ? <span className="h-2 w-2 rounded-full bg-indigo-600" /> : null}
                </span>
              </div>

              {method.description ? (
                <p className="mt-0.5 text-xs text-slate-500">{method.description}</p>
              ) : null}

              {method.fee ? (
                <p className="mt-1 text-[11px] font-medium text-slate-400">{method.fee}</p>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
});

PaymentMethodSelector.propTypes = {
  methods: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      fee: PropTypes.string,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  columns: PropTypes.oneOf([1, 2, 3]),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default PaymentMethodSelector;