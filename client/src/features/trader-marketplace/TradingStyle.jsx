import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Target, ArrowLeft, Loader2, RefreshCw, TrendingUp, Clock, Activity } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import TraderStyleBadge from '../../components/domain/trader/TraderStyleBadge';
import ProgressBar from '../../components/common/ProgressBar';

const TradingStyle = function TradingStyle() {
  const { traderId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/marketplace/traders/${traderId}/style`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
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

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : data ? (
          <Card padding="lg">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Target size={20} aria-hidden="true" />
              </span>
              <div>
                <Heading level={1} size="text-2xl">
                  Trading Style
                </Heading>
                <div className="mt-2">
                  {data.style ? <TraderStyleBadge style={data.style} size="md" /> : null}
                </div>
              </div>
            </div>

            <Separator spacing="md" />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Avg Holding Time
                </p>
                <p className="mt-1 flex items-center gap-1 text-base font-semibold text-slate-900">
                  <Clock size={14} aria-hidden="true" />
                  {data.avgHoldingTime || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Trades Per Day
                </p>
                <p className="mt-1 flex items-center gap-1 text-base font-semibold text-slate-900">
                  <Activity size={14} aria-hidden="true" />
                  {data.tradesPerDay || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Avg R:R
                </p>
                <p className="mt-1 flex items-center gap-1 text-base font-semibold text-slate-900">
                  <TrendingUp size={14} aria-hidden="true" />
                  {data.avgRR || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Preferred Symbols
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {data.preferredSymbols?.length || 0}
                </p>
              </div>
            </div>

            {data.preferredSymbols?.length > 0 ? (
              <>
                <Separator spacing="md" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Preferred Symbols
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {data.preferredSymbols.map((symbol) => (
                      <span
                        key={symbol}
                        className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                      >
                        {symbol}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {data.styleBreakdown ? (
              <>
                <Separator spacing="md" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Style Breakdown
                  </p>
                  <div className="mt-3 space-y-3">
                    {Object.entries(data.styleBreakdown).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium capitalize text-slate-600">{key}</span>
                          <span className="font-semibold text-slate-900">{value}%</span>
                        </div>
                        <ProgressBar
                          value={value}
                          max={100}
                          size="sm"
                          variant="primary"
                          className="mt-1.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </Card>
        ) : (
          <Card padding="lg">
            <Text color="muted">No style data available for this trader.</Text>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default TradingStyle;