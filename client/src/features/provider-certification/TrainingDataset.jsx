import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const TrainingDataset = function TrainingDataset() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-certification/training-dataset', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setMessages(payload.data?.messages || []);
        setData(payload.data?.summary);
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

  const handleBack = useCallback(() => navigate('/provider/certification'), [navigate]);

  const columns = [
    {
      key: 'text',
      header: 'Message',
      accessor: 'text',
      render: (value) => (
        <span className="line-clamp-2 text-xs text-slate-700">{value}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      accessor: 'type',
      render: (value) => (
        <Badge variant="neutral" size="xs">
          {value}
        </Badge>
      ),
    },
    {
      key: 'parsed',
      header: 'Parsed',
      accessor: 'parsed',
      align: 'right',
      render: (value) => (
        <span
          className={[
            'text-xs font-semibold',
            value ? 'text-emerald-600' : 'text-rose-600',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'confidence',
      header: 'Confidence',
      accessor: 'confidence',
      align: 'right',
      render: (value) =>
        value !== undefined ? (
          <span className="text-xs font-semibold text-slate-800">
            {Math.round(value * 100)}%
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
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
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <FileText size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Training Dataset
            </Heading>
            <Text color="muted" className="text-xs">
              Historical messages used to train your Provider DNA
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Messages"
            value={data?.totalMessages || 0}
            icon={FileText}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Parsed Successfully"
            value={data?.parsedSuccessfully || 0}
            icon={FileText}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Failed to Parse"
            value={data?.failedToParse || 0}
            icon={FileText}
            variant="danger"
            loading={loading}
          />
          <StatCard
            label="Avg Confidence"
            value={data?.avgConfidence !== undefined ? `${data.avgConfidence}%` : '—'}
            icon={FileText}
            variant="info"
            loading={loading}
          />
        </div>

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Messages
          </Heading>

          <div className="mt-4">
            <DataTable
              columns={columns}
              rows={messages}
              rowKey="id"
              loading={loading}
              searchable
              emptyState={
                <EmptyState
                  icon={FileText}
                  title="No training messages"
                  description="Import historical messages to build your training dataset."
                />
              }
            />
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default TrainingDataset;