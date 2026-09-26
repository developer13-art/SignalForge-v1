import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import WalletTransactionCard from '../../components/domain/wallet/WalletTransactionCard';
import EmptyState from '../../components/common/EmptyState';

const PendingBalance = function PendingBalance() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [balanceRes, txRes] = await Promise.all([
        fetch('/api/wallet/balance', { credentials: 'include' }),
        fetch('/api/wallet/transactions?status=pending&limit=20', { credentials: 'include' }),
      ]);

      const balancePayload = await balanceRes.json();
      const txPayload = await txRes.json();

      if (balanceRes.ok) {
        setData(balancePayload.data);
      }
      if (txRes.ok) {
        setTransactions(txPayload.data || []);
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

  const handleBack = useCallback(() => navigate('/wallet'), [navigate]);

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
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Pending Balance
            </Heading>
            <Text color="muted" className="text-xs">
              Funds pending settlement or review
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Pending Balance"
            value={data?.pendingBalance !== undefined ? `$${data.pendingBalance}` : '—'}
            icon={Clock}
            variant="warning"
            loading={loading}
          />
          <StatCard
            label="Under Review"
            value={data?.underReview !== undefined ? `$${data.underReview}` : '—'}
            icon={Clock}
            variant="danger"
            loading={loading}
          />
          <StatCard
            label="Awaiting Settlement"
            value={data?.awaitingSettlement !== undefined ? `$${data.awaitingSettlement}` : '—'}
            icon={Clock}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Next Settlement"
            value={data?.nextSettlement || '—'}
            icon={Clock}
            variant="primary"
            loading={loading}
          />
        </div>

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Pending Transactions
          </Heading>

          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 size={28} className="animate-spin" aria-hidden="true" />
              </div>
            ) : transactions.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No pending transactions"
                description="Any pending funds will appear here."
              />
            ) : (
              transactions.map((tx) => (
                <WalletTransactionCard key={tx.id} transaction={tx} currency="USD" />
              ))
            )}
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default PendingBalance;