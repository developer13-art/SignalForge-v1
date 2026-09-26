import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ArrowLeft, Loader2, Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';
import Badge from '../../components/common/Badge';

const CustomPricing = function CustomPricing() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/white-label/pricing', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setPlans(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (id, field, value) => {
    setPlans((prev) =>
      prev.map((plan) => (plan.id === id ? { ...plan, [field]: value } : plan)),
    );
  };

  const handleAdd = () => {
    setPlans((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: 'New Plan',
        monthlyPrice: 0,
        yearlyPrice: 0,
        active: true,
      },
    ]);
  };

  const handleRemove = (id) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/white-label/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plans }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to save pricing');
        return;
      }

      setSuccess(true);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [plans]);

  const handleBack = useCallback(() => navigate('/white-label'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleAdd} leadingIcon={Plus}>
            Add Plan
          </Button>
        </div>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <DollarSign size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Custom Pricing
            </Heading>
            <Text color="muted" className="text-xs">
              Set your own subscription prices for end users
            </Text>
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        {success ? (
          <div className="mt-4">
            <Alert variant="success" size="sm">
              Pricing saved.
            </Alert>
          </div>
        ) : null}

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={plan.active ? 'success' : 'neutral'} size="xs">
                      {plan.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(plan.id)}
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Remove"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormField label="Plan Name">
                    {({ id }) => (
                      <input
                        id={id}
                        type="text"
                        value={plan.name}
                        onChange={(event) => handleChange(plan.id, 'name', event.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                      />
                    )}
                  </FormField>

                  <FormField label="Monthly Price ($)">
                    {({ id }) => (
                      <input
                        id={id}
                        type="number"
                        min={0}
                        step={1}
                        value={plan.monthlyPrice}
                        onChange={(event) =>
                          handleChange(plan.id, 'monthlyPrice', Number(event.target.value))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                      />
                    )}
                  </FormField>

                  <FormField label="Yearly Price ($)">
                    {({ id }) => (
                      <input
                        id={id}
                        type="number"
                        min={0}
                        step={1}
                        value={plan.yearlyPrice}
                        onChange={(event) =>
                          handleChange(plan.id, 'yearlyPrice', Number(event.target.value))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                      />
                    )}
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-4">
          <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
            {saving ? 'Saving...' : 'Save Pricing'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default CustomPricing;