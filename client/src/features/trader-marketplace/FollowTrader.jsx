import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, Server, Shield, Layers } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import NumberInput from '../../components/forms/NumberInput';
import Alert from '../../components/feedback/Alert';

const FollowTrader = function FollowTrader() {
  const { traderId } = useParams();
  const navigate = useNavigate();

  const [trader, setTrader] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [copyMode, setCopyMode] = useState('proportional');
  const [copyRatio, setCopyRatio] = useState(100);
  const [maxOpenTrades, setMaxOpenTrades] = useState(10);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [traderRes, accountsRes] = await Promise.all([
        fetch(`/api/marketplace/traders/${traderId}`, { credentials: 'include' }),
        fetch('/api/brokers/accounts', { credentials: 'include' }),
      ]);

      const traderPayload = await traderRes.json();
      const accountsPayload = await accountsRes.json();

      if (traderRes.ok) {
        setTrader(traderPayload.data?.trader);
      }
      if (accountsRes.ok) {
        setAccounts(accountsPayload.data || []);
        if (accountsPayload.data?.[0]) {
          setSelectedAccount(accountsPayload.data[0].id);
        }
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [traderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/marketplace/traders/${traderId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          brokerAccountId: selectedAccount || null,
          copyMode,
          copyRatio,
          maxOpenTrades,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to follow trader');
        return;
      }

      navigate('/traders/following', { replace: true });
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSubmitting(false);
    }
  }, [traderId, selectedAccount, copyMode, copyRatio, maxOpenTrades, navigate]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

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
              Follow {trader?.name || 'Trader'}
            </Heading>
            <Text color="muted" className="text-xs">
              Configure how this trader's positions will be copied to your account
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

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <>
            <Separator spacing="md" />

            <div className="space-y-6">
              <div>
                <Heading level={3} size="text-base">
                  Trading account
                </Heading>
                <Text color="muted" className="mt-1 text-xs">
                  Positions will be copied to this account.
                </Text>

                {accounts.length === 0 ? (
                  <Alert variant="warning" size="sm" className="mt-3">
                    <p className="text-xs">
                      Connect a broker account first to follow this trader.
                    </p>
                  </Alert>
                ) : (
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {accounts.map((account) => {
                      const isSelected = selectedAccount === account.id;
                      return (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => setSelectedAccount(account.id)}
                          className={[
                            'flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors',
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-slate-200 bg-white hover:border-slate-300',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                            <Server size={14} aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {account.nickname || account.broker}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {account.platform} · {account.login}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <FormField label="Copy Mode" description="How positions should be scaled to your account">
                {({ id }) => (
                  <select
                    id={id}
                    value={copyMode}
                    onChange={(event) => setCopyMode(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="proportional">Proportional (ratio of account size)</option>
                    <option value="fixed">Fixed lot size</option>
                    <option value="multiplier">Multiplier of trader lot</option>
                  </select>
                )}
              </FormField>

              <FormField label="Copy Ratio (%)" description="Percentage of the trader's position to copy">
                {({ id }) => (
                  <NumberInput
                    id={id}
                    value={copyRatio}
                    onChange={(value) => setCopyRatio(Number(value) || 0)}
                    min={1}
                    max={200}
                    step={1}
                    precision={0}
                  />
                )}
              </FormField>

              <FormField label="Max Open Trades" description="Maximum concurrent positions from this trader">
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

              <Alert variant="info" size="sm">
                <p className="text-xs">
                  Your risk profile and account-specific settings will always apply. Risk checks
                  run before any copied order.
                </p>
              </Alert>
            </div>

            <div className="mt-8 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
              <Button variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting || accounts.length === 0}
                leadingIcon={CheckCircle2}
              >
                {submitting ? 'Following...' : 'Follow Trader'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default FollowTrader;