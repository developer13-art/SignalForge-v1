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

const MaximumOpenTrades = function MaximumOpenTrades() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maxOpenTrades, setMaxOpenTrades] = useState(5);
  const [perSymbolMax, setPerSymbolMax] = useState(2);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/max-open-trades', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
        setMaxOpenTrades(payload.data?.maxOpenTrades || 5);
        setPerSymbolMax(payload.data?.perSymbolMax || 2);
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
      await fetch('/api/risk/max-open-trades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ maxOpenTrades, perSymbolMax }),
      });
      navigate('/risk');
    } catch (_err) {
      // silent
    } finally {
      setSaving(false);
    }
  }, [maxOpenTrades, perSymbolMax, navigate]);

  const handleBack = useCallback(() => navigate('/risk'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Layers size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Maximum Open Trades
            </Heading>
            <Text color="muted" className="text-xs">
              Limit total and per-symbol concurrent positions
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
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-medium text-slate-500">Current open</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {data?.openTrades || 0}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-500">Maximum allowed</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {data?.maxOpenTrades || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <FormField
                label="Maximum Concurrent Trades"
                description="Total positions across all symbols"
              >
                {({ id }) => (
                  <NumberInput
                    id={id}
                    value={maxOpenTrades}
                    onChange={(value) => setMaxOpenTrades(Number(value) || 0)}
                    min={1}
                    max={100}
                    step={1}
                    precision={0}
                  />
                )}
              </FormField>

              <FormField
                label="Maximum Trades Per Symbol"
                description="Limit positions on the same symbol"
              >
                {({ id }) => (
                  <NumberInput
                    id={id}
                    value={perSymbolMax}
                    onChange={(value) => setPerSymbolMax(Number(value) || 0)}
                    min={1}
                    max={20}
                    step={1}
                    precision={0}
                  />
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

export default MaximumOpenTrades;