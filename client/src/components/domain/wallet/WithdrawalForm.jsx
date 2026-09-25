import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Building2, Coins, AlertCircle } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import CurrencyInput from '../../forms/CurrencyInput';
import FormField from '../../forms/FormField';
import Button from '../../common/Button';
import Alert from '../../feedback/Alert';

const METHODS = [
  { id: 'bank', label: 'Bank Transfer', icon: Building2, description: '1-3 business days' },
  { id: 'crypto', label: 'Crypto (USDT/SOL)', icon: Coins, description: 'Within 30 minutes' },
];

const WithdrawalForm = forwardRef(function WithdrawalForm(
  {
    available = 0,
    minAmount = 10,
    currency = 'USD',
    onSubmit,
    onCancel,
    submitting = false,
    error,
    kycVerified = true,
    defaultValues,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [method, setMethod] = useState(defaultValues?.method || 'bank');
  const [amount, setAmount] = useState(defaultValues?.amount || '');
  const [bankDetails, setBankDetails] = useState({
    accountName: defaultValues?.accountName || '',
    accountNumber: defaultValues?.accountNumber || '',
    bankName: defaultValues?.bankName || '',
  });
  const [walletAddress, setWalletAddress] = useState(defaultValues?.walletAddress || '');
  const [errors, setErrors] = useState({});

  const numericAmount = useMemo(() => Number(amount) || 0, [amount]);

  const validate = useCallback(() => {
    const nextErrors = {};

    if (!numericAmount || numericAmount <= 0) {
      nextErrors.amount = 'Enter a valid amount';
    } else if (numericAmount < minAmount) {
      nextErrors.amount = `Minimum withdrawal is ${currency} ${minAmount}`;
    } else if (numericAmount > available) {
      nextErrors.amount = 'Amount exceeds available balance';
    }

    if (method === 'bank') {
      if (!bankDetails.accountName.trim()) {
        nextErrors.accountName = 'Account name is required';
      }
      if (!bankDetails.accountNumber.trim()) {
        nextErrors.accountNumber = 'Account number is required';
      }
      if (!bankDetails.bankName.trim()) {
        nextErrors.bankName = 'Bank name is required';
      }
    }

    if (method === 'crypto') {
      if (!walletAddress.trim()) {
        nextErrors.walletAddress = 'Wallet address is required';
      } else if (walletAddress.trim().length < 32) {
        nextErrors.walletAddress = 'Enter a valid wallet address';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [numericAmount, minAmount, currency, available, method, bankDetails, walletAddress]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    if (onSubmit) {
      onSubmit({
        method,
        amount: numericAmount,
        bankDetails: method === 'bank' ? bankDetails : undefined,
        walletAddress: method === 'crypto' ? walletAddress : undefined,
      });
    }
  };

  const handleMaxAmount = () => {
    setAmount(String(available));
  };

  return (
    <form
      ref={ref}
      onSubmit={handleSubmit}
      className={['space-y-5', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {!kycVerified ? (
        <Alert variant="warning" size="sm">
          <p className="text-xs font-semibold">KYC verification required</p>
          <p className="mt-1 text-xs">
            You must complete identity verification before requesting a withdrawal.
          </p>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="danger" size="sm">
          {typeof error === 'string' ? error : error.message}
        </Alert>
      ) : null}

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Withdrawal Method</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {METHODS.map((m) => {
            const Icon = m.icon;
            const isActive = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={[
                  'flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-colors',
                  isActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span
                  className={[
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Icon size={16} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{m.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{m.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <FormField
        label="Amount"
        error={errors.amount}
        required
        description={`Available: ${currency} ${available} · Minimum: ${currency} ${minAmount}`}
      >
        {() => (
          <div className="relative">
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              currency={currency}
              min={0}
              max={available}
            />
            <button
              type="button"
              onClick={handleMaxAmount}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Max
            </button>
          </div>
        )}
      </FormField>

      <Separator spacing="sm" />

      {method === 'bank' ? (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Bank Account Details
          </h4>

          <FormField label="Account Holder Name" error={errors.accountName} required>
            {({ id }) => (
              <input
                id={id}
                type="text"
                value={bankDetails.accountName}
                onChange={(event) =>
                  setBankDetails((prev) => ({ ...prev, accountName: event.target.value }))
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}
          </FormField>

          <FormField label="Account Number" error={errors.accountNumber} required>
            {({ id }) => (
              <input
                id={id}
                type="text"
                inputMode="numeric"
                value={bankDetails.accountNumber}
                onChange={(event) =>
                  setBankDetails((prev) => ({
                    ...prev,
                    accountNumber: event.target.value.replace(/\D/g, ''),
                  }))
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}
          </FormField>

          <FormField label="Bank Name" error={errors.bankName} required>
            {({ id }) => (
              <input
                id={id}
                type="text"
                value={bankDetails.bankName}
                onChange={(event) =>
                  setBankDetails((prev) => ({ ...prev, bankName: event.target.value }))
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}
          </FormField>
        </div>
      ) : null}

      {method === 'crypto' ? (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Wallet Address
          </h4>

          <FormField
            label="Destination Wallet"
            error={errors.walletAddress}
            required
            description="USDT (Solana) or SOL wallet address"
          >
            {({ id }) => (
              <input
                id={id}
                type="text"
                value={walletAddress}
                onChange={(event) => setWalletAddress(event.target.value.trim())}
                placeholder="Enter wallet address"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}
          </FormField>
        </div>
      ) : null}

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
          <AlertCircle size={12} aria-hidden="true" />
          Withdrawal Notice
        </p>
        <p className="mt-1 text-xs text-amber-800">
          Withdrawals are processed manually. Please verify all details carefully. Incorrect
          information may result in delayed or failed payouts.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          disabled={submitting || !kycVerified}
        >
          {submitting ? 'Submitting...' : 'Request Withdrawal'}
        </Button>
      </div>
    </form>
  );
});

WithdrawalForm.propTypes = {
  available: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  minAmount: PropTypes.number,
  currency: PropTypes.string,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  kycVerified: PropTypes.bool,
  defaultValues: PropTypes.object,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default WithdrawalForm;