import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import Button from '../../common/Button';
import Alert from '../../feedback/Alert';
import FormField from '../../forms/FormField';

const StripePaymentForm = forwardRef(function StripePaymentForm(
  {
    amount,
    currency = 'USD',
    onSubmit,
    onCancel,
    submitting = false,
    error,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [card, setCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });
  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) =>
    value
      .replace(/\D/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim()
      .slice(0, 19);

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length <= 2) {
      return cleaned;
    }
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  };

  const validate = () => {
    const nextErrors = {};
    if (card.number.replace(/\s/g, '').length < 15) {
      nextErrors.number = 'Enter a valid card number';
    }
    if (!card.name.trim()) {
      nextErrors.name = 'Cardholder name is required';
    }
    if (card.expiry.length !== 5) {
      nextErrors.expiry = 'Enter a valid expiry date';
    }
    if (card.cvc.length < 3) {
      nextErrors.cvc = 'Enter a valid CVC';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    if (onSubmit) {
      onSubmit(card);
    }
  };

  return (
    <form
      ref={ref}
      onSubmit={handleSubmit}
      className={['space-y-4', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
            <CreditCard size={16} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Card Payment</p>
            <p className="text-[11px] text-slate-500">
              Pay {currency} {amount}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Lock size={10} aria-hidden="true" />
          <span>Secured by Stripe</span>
        </div>
      </div>

      {error ? (
        <Alert variant="danger" size="sm">
          {typeof error === 'string' ? error : error.message}
        </Alert>
      ) : null}

      <FormField label="Card Number" error={errors.number} required>
        {({ id }) => (
          <input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            value={card.number}
            onChange={(event) =>
              setCard((prev) => ({ ...prev, number: formatCardNumber(event.target.value) }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        )}
      </FormField>

      <FormField label="Cardholder Name" error={errors.name} required>
        {({ id }) => (
          <input
            id={id}
            type="text"
            autoComplete="cc-name"
            placeholder="Name as it appears on the card"
            value={card.name}
            onChange={(event) => setCard((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        )}
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Expiry Date" error={errors.expiry} required>
          {({ id }) => (
            <input
              id={id}
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={(event) =>
                setCard((prev) => ({ ...prev, expiry: formatExpiry(event.target.value) }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}
        </FormField>

        <FormField label="CVC" error={errors.cvc} required>
          {({ id }) => (
            <input
              id={id}
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              maxLength={4}
              value={card.cvc}
              onChange={(event) =>
                setCard((prev) => ({ ...prev, cvc: event.target.value.replace(/\D/g, '') }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}
        </FormField>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
        <ShieldCheck size={14} className="text-emerald-600" aria-hidden="true" />
        <p className="text-xs text-slate-600">
          Your card details are tokenized and stored securely by Stripe. SignalForge never sees
          your full card number.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" variant="primary" disabled={submitting} leadingIcon={Lock}>
          {submitting ? 'Processing...' : `Pay ${currency} ${amount}`}
        </Button>
      </div>
    </form>
  );
});

StripePaymentForm.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default StripePaymentForm;