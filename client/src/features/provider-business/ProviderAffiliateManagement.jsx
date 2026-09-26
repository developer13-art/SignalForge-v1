import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const ProviderAffiliateManagement = function ProviderAffiliateManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/affiliate', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setAffiliates(payload.data?.affiliates || []);
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
    if (!data?.affiliateLink) {
      return;
    }
    try {
      await navigator.clipboard.writeText(data.affiliateLink);
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
      header: 'Affiliate',
      accessor: 'name',
      render: (value) => <span className="text-sm font-medium text-slate-800">{value}</span>,
    },
    {
      key: 'joinedAt',
      header: 'Joined',
      accessor: 'joinedAt',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'referrals',
      header: 'Referrals',
      accessor: 'referrals',
      align: 'right',
      render: (value) => <span className="text-sm text-slate-800">{value || 0}</span>,
    },
    {
      key: 'commission',
      header: 'Commission',
      accessor: 'commission',
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
              Affiliate Management
            </Heading>
            <Text color="muted" className="text-xs">
              Manage your affiliate partners and commissions
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Affiliates"
            value={data?.totalAffiliates || 0}
            icon={Users}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Active"
            value={data?.activeAffiliates || 0}
            icon={Users}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Total Commissions"
            value={data?.totalCommissions !== undefined ? `$${data.totalCommissions}` : '—'}
            icon={Users}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="This Month"
            value={data?.monthlyCommissions !== undefined ? `$${data.monthlyCommissions}` : '—'}
            icon={Users}
            variant="info"
            loading={loading}
          />
        </div>

        {data?.affiliateLink ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Your Affiliate Link
            </Heading>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">
                {data.affiliateLink}
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
            Affiliate Partners
          </Heading>

          <div className="mt-4">
            <DataTable
              columns={columns}
              rows={affiliates}
              rowKey="id"
              loading={loading}
              searchable
              emptyState={
                <EmptyState
                  icon={Users}
                  title="No affiliate partners yet"
                  description="Invite affiliates to grow your reach."
                />
              }
            />
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default ProviderAffiliateManagement;