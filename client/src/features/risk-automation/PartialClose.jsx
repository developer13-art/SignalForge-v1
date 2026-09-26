import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, Loader2, Save } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import NumberInput from '../../components/forms/NumberInput';

const PartialClose = function PartialClose() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    enabled: true,
    firstClosePercent: 50,
    firstTargetPercent: 1,
    secondClosePercent: 50,
    secondTargetPercent: 2,
  });

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/partial-close', { credentials: 'include' });
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
      await fetch('/api/risk/partial-close', {
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Layers size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Partial Close
            </Heading>
            <Text color="muted" className="text-xs">
              Automatically close portions of a trade as profit targets are reached
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
                  Enable automatic partial close
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Portions of the position are closed as profit targets are hit.
                </p>
              </div>
            </label>

            {config.enabled ? (
              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    First Target
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="At Profit (%)">
                      {({ id }) => (
                        <NumberInput
                          id={id}
                          value={config.firstTargetPercent}
                          onChange={(value) =>
                            setConfig((prev) => ({
                              ...prev,
                              firstTargetPercent: Number(value) || 0,
                            }))
                          }
                          min={0.1}
                          max={100}
                          step={0.1}
                          precision={2}
                        />
                      )}
                    </FormField>

                    <FormField label="Close (%)">
                      {({ id }) => (
                        <NumberInput
                          id={id}
                          value={config.firstClosePercent}
                          onChange={(value) =>
                            setConfig((prev) => ({
                              ...prev,
                              firstClosePercent: Number(value) || 0,
                            }))
                          }
                          min={1}
                          max={100}
                          step={1}
                          precision={0}
                        />
                      )}
                    </FormField>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Second Target
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="At Profit (%)">
                      {({ id }) => (
                        <NumberInput
                          id={id}
                          value={config.secondTargetPercent}
                          onChange={(value) =>
                            setConfig((prev) => ({
                              ...prev,
                              secondTargetPercent: Number(value) || 0,
                            }))
                          }
                          min={0.1}
                          max={100}
                          step={0.1}
                          precision={2}
                        />
                      )}
                    </FormField>

                    <FormField label="Close (%)">
                      {({ id }) => (
                        <NumberInput
                          id={id}
                          value={config.secondClosePercent}
                          onChange={(value) =>
                            setConfig((prev) => ({
                              ...prev,
                              secondClosePercent: Number(value) || 0,
                            }))
                          }
                          min={1}
                          max={100}
                          step={1}
                          precision={0}
                        />
                      )}
                    </FormField>
                  </div>
                </div>
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

export default PartialClose;