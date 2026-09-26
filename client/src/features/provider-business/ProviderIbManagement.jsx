import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, RefreshCw, Plus, Copy, Check } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const ProviderIbManagement = function ProviderIbManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/ib', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setReferrals(payload.data?.referrals || []);
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

  const handleCopy = useCallback(async () => {
    if (!data?.ibLink) {
      return;
    }
    try {
      await navigator.clipboard.writeText(data.ibLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {
      // silent
    }
  }, [data]);

  const handleBack = useCallback(() => navigate('/provider'), [navigate]);

  const columns = [
    {
      key: 'name',
      header: 'Referred Broker Account',
      accessor: 'name',
      render: (value) => <span className="text-sm font-medium text-slate-800">{value}</span>,
    },
    {
      key: 'broker',
      header: 'Broker',
      accessor: 'broker',
      render: (value) => <span className="text-xs text-slate-600">{value}</span>,
    },
    {
      key: 'joinedAt',
      header: 'Joined',
      accessor: 'joinedAt',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'revenue',
      header: 'IB Revenue',
      accessor: 'revenue',
      align: 'right',
      render: (value) => (
        <span className="text-sm font-semibold text-emerald-600">${value || 0}</span>
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
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Introducing Broker Management
            </Heading>
            <Text color="muted" className="text-xs">
              Track broker-referred accounts and IB revenue
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Referrals"
            value={data?.totalReferrals || 0}
            icon={Users}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Active"
            value={data?.activeReferrals || 0}
            icon={Users}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Total IB Revenue"
            value={data?.totalRevenue !== undefined ? `$${data.totalRevenue}` : '—'}
            icon={Users}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="This Month"
            value={data?.monthlyRevenue !== undefined ? `$${data.monthlyRevenue}` : '—'}
            icon={Users}
            variant="info"
            loading={loading}
          />
        </div>

        {data?.ibLink ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Your IB Referral Link
            </Heading>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">
                {data.ibLink}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy"
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-600" aria-hidden="true" />
                ) : (
                  <Copy size={14} aria-hidden="true" />
                )}
              </button>
            </div>
          </Card>
        ) : null}

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            IB Referrals
          </Heading>

          <div className="mt-4">
            <DataTable
              columns={columns}
              rows={referrals}
              rowKey="id"
              loading={loading}
              searchable
              emptyState={
                <EmptyState
                  icon={Users}
                  title="No IB referrals yet"
                  description="Share your IB link to start tracking broker referrals."
                />
              }
            />
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default ProviderIbManagement;