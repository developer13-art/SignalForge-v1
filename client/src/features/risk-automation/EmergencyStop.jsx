import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Loader2, RefreshCw, Activity } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmergencyStopButton from '../../components/domain/risk/EmergencyStopButton';

const EmergencyStop = function EmergencyStop() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/emergency-stop', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setStatus(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleStop = useCallback(async () => {
    try {
      await fetch('/api/risk/emergency-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'stop' }),
      });
      fetchStatus();
    } catch (_err) {
      // silent
    }
  }, [fetchStatus]);

  const handleResume = useCallback(async () => {
    try {
      await fetch('/api/risk/emergency-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'resume' }),
      });
      fetchStatus();
    } catch (_err) {
      // silent
    }
  }, [fetchStatus]);

  const handleBack = useCallback(() => navigate('/risk'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Emergency Stop
              </Heading>
              <Text color="muted" className="text-xs">
                Immediately halt all automated trading across your accounts
              </Text>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStatus}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
        </div>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <>
            <div
              className={[
                'rounded-lg border p-4',
                status?.active
                  ? 'border-rose-200 bg-rose-50'
                  : 'border-emerald-200 bg-emerald-50',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="flex items-center gap-3">
                <span
                  className={[
                    'flex h-11 w-11 items-center justify-center rounded-full bg-white',
                    status?.active ? 'text-rose-600' : 'text-emerald-600',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Activity size={20} aria-hidden="true" />
                </span>
                <div>
                  <p
                    className={[
                      'text-sm font-semibold',
                      status?.active ? 'text-rose-900' : 'text-emerald-900',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {status?.active ? 'Automated trading is STOPPED' : 'Automated trading is active'}
                  </p>
                  <p
                    className={[
                      'mt-0.5 text-xs',
                      status?.active ? 'text-rose-800' : 'text-emerald-800',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {status?.active
                      ? `Stopped ${status.stoppedAt || 'recently'}`
                      : 'All accounts are running normally'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-900">What happens next</p>
                <ul className="mt-2 space-y-1 text-xs text-amber-800">
                  <li>· All new automated trades are blocked immediately.</li>
                  <li>· Existing open positions are NOT closed automatically.</li>
                  <li>· You can resume trading at any time.</li>
                </ul>
              </div>

              <div className="flex justify-center pt-2">
                <EmergencyStopButton
                  active={status?.active}
                  onStop={handleStop}
                  onResume={handleResume}
                  size="lg"
                />
              </div>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default EmergencyStop;