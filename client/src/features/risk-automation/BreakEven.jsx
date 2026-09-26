import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Loader2, Save } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import NumberInput from '../../components/forms/NumberInput';

const BreakEven = function BreakEven() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    enabled: true,
    activationPercent: 0.5,
    offsetPoints: 0,
  });

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/break-even', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok && payload.data) {
        setConfig(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch('/api/risk/break-even', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config),
      });
      navigate('/risk');
    } catch (_err) {
      // silent
    } finally {
      setSaving(false);
    }
  }, [config, navigate]);

  const handleBack = useCallback(() => navigate('/risk'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Break Even
            </Heading>
            <Text color="muted" className="text-xs">
              Move stop loss to entry once profit reaches your threshold
            </Text>
          </div>
        </div>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <>
            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(event) =>
                  setConfig((prev) => ({ ...prev, enabled: event.target.checked }))
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Enable automatic break even
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Stop loss moves to entry price when profit hits the activation threshold.
                </p>
              </div>
            </label>

            {config.enabled ? (
              <div className="mt-6 space-y-4">
                <FormField
                  label="Activation (% profit)"
                  description="Profit percentage at which stop loss moves to break even"
                >
                  {({ id }) => (
                    <NumberInput
                      id={id}
                      value={config.activationPercent}
                      onChange={(value) =>
                        setConfig((prev) => ({ ...prev, activationPercent: Number(value) || 0 }))
                      }
                      min={0.1}
                      max={10}
                      step={0.1}
                      precision={2}
                    />
                  )}
                </FormField>

                <FormField
                  label="Offset (points)"
                  description="Additional distance beyond break even (positive) or before (negative)"
                >
                  {({ id }) => (
                    <NumberInput
                      id={id}
                      value={config.offsetPoints}
                      onChange={(value) =>
                        setConfig((prev) => ({ ...prev, offsetPoints: Number(value) || 0 }))
                      }
                      min={-100}
                      max={100}
                      step={1}
                      precision={0}
                    />
                  )}
                </FormField>
              </div>
            ) : null}

            <div className="mt-8 flex justify-end border-t border-slate-200 pt-4">
              <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default BreakEven;