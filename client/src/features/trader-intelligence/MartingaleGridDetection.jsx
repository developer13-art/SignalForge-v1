import React, { useCallback, useEffect, useState } from 'react';
import { Repeat, RefreshCw, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import StatCard from '../../components/data-display/StatCard';

const MartingaleGridDetection = function MartingaleGridDetection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trader-intelligence/martingale-grid', {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Repeat size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Martingale/Grid Detection
            </Heading>
            <Text color="muted" className="text-xs">
              Detects high-risk position management patterns
            </Text>
          </div>
        </div>

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

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Martingale Events"
          value={data?.martingaleEvents || 0}
          icon={Repeat}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Grid Events"
          value={data?.gridEvents || 0}
          icon={Repeat}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Risk Level"
          value={data?.riskLevel || '—'}
          icon={AlertTriangle}
          variant={data?.riskLevel === 'high' ? 'danger' : data?.riskLevel === 'medium' ? 'warning' : 'success'}
          loading={loading}
        />
        <StatCard
          label="Safety Score"
          value={data?.safetyScore !== undefined ? `${data.safetyScore}%` : '—'}
          icon={CheckCircle2}
          variant="success"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Detections
        </Heading>

        <Separator spacing="md" />

        {data?.detections && data.detections.length > 0 ? (
          <ul className="space-y-3">
            {data.detections.map((detection, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3"
              >
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-600"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-900">{detection.title}</p>
                  <p className="mt-0.5 text-xs text-amber-800">{detection.description}</p>
                  {detection.occurredAt ? (
                    <p className="mt-1 text-[11px] text-amber-700">
                      Detected {detection.occurredAt}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-center">
            <CheckCircle2
              size={24}
              className="mx-auto text-emerald-600"
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-emerald-900">
              No martingale or grid patterns detected
            </p>
            <p className="mt-1 text-xs text-emerald-800">
              Your trading does not show high-risk averaging patterns.
            </p>
          </div>
        )}

        {data?.notes ? (
          <>
            <Separator spacing="md" />
            <p className="text-xs text-slate-600">{data.notes}</p>
          </>
        ) : null}
      </Card>
    </Container>
  );
};

export default MartingaleGridDetection;