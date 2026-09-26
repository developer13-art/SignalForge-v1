import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Loader2, RefreshCw, ArrowDownToLine } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import WalletTransactionCard from '../../components/domain/wallet/WalletTransactionCard';
import EmptyState from '../../components/common/EmptyState';

const AvailableBalance = function AvailableBalance() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [balanceRes, txRes] = await Promise.all([
        fetch('/api/wallet/balance', { credentials: 'include' }),
        fetch('/api/wallet/transactions?type=credit&limit=20', { credentials: 'include' }),
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Wallet size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Available Balance
            </Heading>
            <Text color="muted" className="text-xs">
              Funds you can withdraw or use for subscriptions
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Available"
            value={data?.availableBalance !== undefined ? `$${data.availableBalance}` : '—'}
            icon={Wallet}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Total Credited"
            value={data?.totalCredited !== undefined ? `$${data.totalCredited}` : '—'}
            icon={Wallet}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Total Withdrawn"
            value={data?.totalWithdrawn !== undefined ? `$${data.totalWithdrawn}` : '—'}
            icon={Wallet}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Currency"
            value={data?.currency || 'USD'}
            icon={Wallet}
            variant="default"
            loading={loading}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            onClick={() => navigate('/wallet/withdraw')}
            leadingIcon={ArrowDownToLine}
          >
            Withdraw Funds
          </Button>
        </div>

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Credits
          </Heading>

          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 size={28} className="animate-spin" aria-hidden="true" />
              </div>
            ) : transactions.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No credits yet"
                description="Your credits will appear here."
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

export default AvailableBalance;