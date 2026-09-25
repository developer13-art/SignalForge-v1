import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Mail, Phone, User, ShieldCheck } from 'lucide-react';
import Button from '../../common/Button';
import Alert from '../../feedback/Alert';
import FormField from '../../forms/FormField';
import PhoneInput from '../../forms/PhoneInput';

const PaystackPaymentForm = forwardRef(function PaystackPaymentForm(
  {
    amount,
    currency = 'NGN',
    defaultValues,
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
  const [values, setValues] = useState({
    email: defaultValues?.email || '',
    name: defaultValues?.name || '',
    phone: defaultValues?.phone || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!values.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!values.name.trim()) {
      nextErrors.name = 'Full name is required';
    }
    if (!values.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
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
      onSubmit(values);
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Pay with Paystack</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Pay {currency} {amount} securely with your card, bank transfer, or USSD
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <ShieldCheck size={12} className="text-emerald-600" aria-hidden="true" />
          <span>PCI-DSS compliant</span>
        </div>
      </div>

      {error ? (
        <Alert variant="danger" size="sm">
          {typeof error === 'string' ? error : error.message}
        </Alert>
      ) : null}

      <FormField label="Full Name" error={errors.name} required>
        {({ id }) => (
          <div className="relative">
            <User
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id={id}
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </FormField>

      <FormField label="Email Address" error={errors.email} required>
        {({ id }) => (
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id={id}
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </FormField>

      <FormField label="Phone Number" error={errors.phone} required>
        {({ id }) => (
          <div className="relative">
            <Phone
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"
              aria-hidden="true"
            />
            <PhoneInput
              id={id}
              value={values.phone}
              onChange={(nextValue) => setValues((prev) => ({ ...prev, phone: nextValue }))}
              defaultCountry="NG"
              placeholder="Phone number"
            />
          </div>
        )}
      </FormField>

      <div className="rounded-md border border-sky-200 bg-sky-50 p-3">
        <p className="text-xs text-sky-800">
          After clicking Pay, you will be redirected to Paystack to complete the payment securely.
          You may be asked to verify with your bank.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Redirecting...' : `Pay ${currency} ${amount}`}
        </Button>
      </div>
    </form>
  );
});

PaystackPaymentForm.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
  defaultValues: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default PaystackPaymentForm;