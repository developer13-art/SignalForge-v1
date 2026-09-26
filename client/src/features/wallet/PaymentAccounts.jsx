import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  Building2,
  Coins,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormField from '../../components/forms/FormField';

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank Account', icon: Building2 },
  { value: 'crypto', label: 'Crypto Wallet', icon: Coins },
];

const PaymentAccounts = function PaymentAccounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [form, setForm] = useState({
    type: 'bank',
    accountName: '',
    accountNumber: '',
    bankName: '',
    walletAddress: '',
  });

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wallet/payment-accounts', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setAccounts(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAdd = useCallback(async () => {
    try {
      const response = await fetch('/api/wallet/payment-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setAdding(false);
        setForm({
          type: 'bank',
          accountName: '',
          accountNumber: '',
          bankName: '',
          walletAddress: '',
        });
        fetchAccounts();
      }
    } catch (_err) {
      // silent
    }
  }, [form, fetchAccounts]);

  const handleRemove = useCallback(async () => {
    if (!removing) {
      return;
    }
    try {
      await fetch(`/api/wallet/payment-accounts/${removing.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setRemoving(null);
      fetchAccounts();
    } catch (_err) {
      // silent
    }
  }, [removing, fetchAccounts]);

  const handleBack = useCallback(() => navigate('/wallet'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAccounts}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <CreditCard size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Payment Accounts
              </Heading>
              <Text color="muted" className="text-xs">
                Saved bank accounts and crypto wallets for withdrawals
              </Text>
            </div>
          </div>

          {!adding ? (
            <Button variant="primary" onClick={() => setAdding(true)} leadingIcon={Plus}>
              Add Account
            </Button>
          ) : null}
        </div>

        {adding ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <FormField label="Account Type">
              {({ id }) => (
                <div className="flex gap-2">
                  {ACCOUNT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isActive = form.type === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, type: type.value }))}
                        className={[
                          'flex flex-1 items-center justify-center gap-2 rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <Icon size={14} aria-hidden="true" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </FormField>

            {form.type === 'bank' ? (
              <div className="mt-4 space-y-4">
                <FormField label="Account Holder Name">
                  {({ id }) => (
                    <input
                      id={id}
                      type="text"
                      value={form.accountName}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, accountName: event.target.value }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  )}
                </FormField>

                <FormField label="Account Number">
                  {({ id }) => (
                    <input
                      id={id}
                      type="text"
                      inputMode="numeric"
                      value={form.accountNumber}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          accountNumber: event.target.value.replace(/\D/g, ''),
                        }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
                    />
                  )}
                </FormField>

                <FormField label="Bank Name">
                  {({ id }) => (
                    <input
                      id={id}
                      type="text"
                      value={form.bankName}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, bankName: event.target.value }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  )}
                </FormField>
              </div>
            ) : (
              <div className="mt-4">
                <FormField label="Wallet Address">
                  {({ id }) => (
                    <input
                      id={id}
                      type="text"
                      value={form.walletAddress}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, walletAddress: event.target.value }))
                      }
                      placeholder="Enter wallet address"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
                    />
                  )}
                </FormField>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAdd}>
                Save Account
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No saved payment accounts"
              description="Add a bank account or crypto wallet to receive withdrawals."
            />
          ) : (
            <ul className="space-y-3">
              {accounts.map((account) => {
                const Icon = account.type === 'crypto' ? Coins : Building2;
                return (
                  <li
                    key={account.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">
                            {account.type === 'bank'
                              ? `${account.bankName} •••• ${account.accountNumber?.slice(-4)}`
                              : account.walletAddress?.slice(0, 8) + '...'}
                          </p>
                          {account.isDefault ? (
                            <Badge variant="success" size="xs">
                              Default
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {account.type === 'bank' ? account.accountName : 'Crypto wallet'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRemoving(account)}
                      className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Remove"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        variant="danger"
        title="Remove payment account"
        description="Are you sure you want to remove this payment account?"
        confirmLabel="Remove"
      />
    </Container>
  );
};

export default PaymentAccounts;