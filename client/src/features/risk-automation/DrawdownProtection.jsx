import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Loader2, Save } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import NumberInput from '../../components/forms/NumberInput';
import ProgressBar from '../../components/common/ProgressBar';

const DrawdownProtection = function DrawdownProtection() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maxDrawdown, setMaxDrawdown] = useState(20);
  const [action, setAction] = useState('pause');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/drawdown', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
        setMaxDrawdown(payload.data?.maxDrawdown || 20);
        setAction(payload.data?.action || 'pause');
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

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch('/api/risk/drawdown', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ maxDrawdown, action }),
      });
      navigate('/risk');
    } catch (_err) {
      // silent
    } finally {
      setSaving(false);
    }
  }, [maxDrawdown, action, navigate]);

  const handleBack = useCallback(() => navigate('/risk'), [navigate]);

  const usagePercent = data?.currentDrawdown !== undefined && data?.maxDrawdown
    ? Math.min(100, (data.currentDrawdown / data.maxDrawdown) * 100)
    : 0;

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Drawdown Protection
            </Heading>
            <Text color="muted" className="text-xs">
              Stop trading when account drawdown exceeds your threshold
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
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Current drawdown</span>
                <span className="font-semibold text-slate-900">
                  {data?.currentDrawdown || 0}% / {data?.maxDrawdown || 0}%
                </span>
              </div>
              <ProgressBar
                value={usagePercent}
                max={100}
                size="md"
                variant={usagePercent > 70 ? 'danger' : usagePercent > 40 ? 'warning' : 'success'}
                className="mt-2"
              />
            </div>

            <div className="mt-6 space-y-4">
              <FormField
                label="Maximum Drawdown (%)"
                description="Trading is paused when account drawdown exceeds this percentage"
              >
                {({ id }) => (
                  <NumberInput
                    id={id}
                    value={maxDrawdown}
                    onChange={(value) => setMaxDrawdown(Number(value) || 0)}
                    min={5}
                    max={100}
                    step={1}
                    precision={0}
                  />
                )}
              </FormField>

              <FormField label="Action on Threshold" description="What should happen when the limit is hit">
                {({ id }) => (
                  <select
                    id={id}
                    value={action}
                    onChange={(event) => setAction(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="pause">Pause new trades only</option>
                    <option value="close_all">Close all positions and pause</option>
                    <option value="notify">Notify only</option>
                  </select>
                )}
              </FormField>
            </div>

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

export default DrawdownProtection;