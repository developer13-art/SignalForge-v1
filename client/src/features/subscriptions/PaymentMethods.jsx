import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Loader2, RefreshCw, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const PaymentMethods = function PaymentMethods() {
  const navigate = useNavigate();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/payment-methods', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setMethods(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleSetDefault = useCallback(
    async (method) => {
      try {
        await fetch(`/api/subscriptions/payment-methods/${method.id}/default`, {
          method: 'POST',
          credentials: 'include',
        });
        fetchMethods();
      } catch (_err) {
        // silent
      }
    },
    [fetchMethods],
  );

  const handleRemove = useCallback(async () => {
    if (!removing) {
      return;
    }
    try {
      await fetch(`/api/subscriptions/payment-methods/${removing.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setRemoving(null);
      fetchMethods();
    } catch (_err) {
      // silent
    }
  }, [removing, fetchMethods]);

  const handleBack = useCallback(() => navigate('/subscriptions'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchMethods}
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
                Payment Methods
              </Heading>
              <Text color="muted" className="text-xs">
                Manage your saved payment methods
              </Text>
            </div>
          </div>

          <Button variant="primary" leadingIcon={Plus}>
            Add Method
          </Button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : methods.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No saved payment methods"
              description="Add a payment method to make future subscriptions easier."
            />
          ) : (
            <ul className="space-y-3">
              {methods.map((method) => (
                <li
                  key={method.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                      <CreditCard size={16} aria-hidden="true" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">
                          {method.brand} •••• {method.last4}
                        </p>
                        {method.isDefault ? (
                          <Badge variant="success" size="xs">
                            Default
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Expires {method.expiry} · {method.provider}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!method.isDefault ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method)}
                        leadingIcon={CheckCircle2}
                      >
                        Set Default
                      </Button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setRemoving(method)}
                      className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Remove"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        variant="danger"
        title="Remove payment method"
        description={
          removing
            ? `Are you sure you want to remove ${removing.brand} ending in ${removing.last4}?`
            : ''
        }
        confirmLabel="Remove"
      />
    </Container>
  );
};

export default PaymentMethods;