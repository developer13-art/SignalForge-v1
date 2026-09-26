import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  RefreshCw,
  Loader2,
  ArrowRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Clock,
  Users,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import WalletBalanceCard from '../../components/domain/wallet/WalletBalanceCard';
import WalletTransactionCard from '../../components/domain/wallet/WalletTransactionCard';
import EmptyState from '../../components/common/EmptyState';

const WalletOverview = function WalletOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [balanceRes, txRes] = await Promise.all([
        fetch('/api/wallet/balance', { credentials: 'include' }),
        fetch('/api/wallet/transactions?limit=5', { credentials: 'include' }),
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

  const quickLinks = [
    { title: 'Available Balance', icon: Wallet, href: '/wallet/available' },
    { title: 'Pending Balance', icon: Clock, href: '/wallet/pending' },
    { title: 'Transactions', icon: ArrowRight, href: '/wallet/transactions' },
    { title: 'Withdraw Funds', icon: ArrowDownToLine, href: '/wallet/withdraw' },
    { title: 'Withdrawal Status', icon: ArrowUpFromLine, href: '/wallet/withdrawals/status' },
    { title: 'Withdrawal History', icon: ArrowUpFromLine, href: '/wallet/withdrawals' },
    { title: 'Payment Accounts', icon: CreditCard, href: '/wallet/payment-accounts' },
    { title: 'Referral Wallet', icon: Users, href: '/referrals/wallet' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Wallet size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Wallet
            </Heading>
            <Text color="muted" className="text-xs">
              Manage your wallet balance, transactions, and withdrawals
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
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-6">
        <WalletBalanceCard
          available={data?.availableBalance || 0}
          pending={data?.pendingBalance || 0}
          lifetimeEarned={data?.lifetimeEarned}
          lifetimeWithdrawn={data?.lifetimeWithdrawn}
          currency={data?.currency || 'USD'}
          loading={loading}
          onWithdraw={() => navigate('/wallet/withdraw')}
          onViewHistory={() => navigate('/wallet/transactions')}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Quick Actions
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => navigate(link.href)}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50"
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className="shrink-0 text-indigo-600" aria-hidden="true" />
                  <span className="text-xs font-medium text-slate-700">{link.title}</span>
                </div>
                <ArrowRight size={12} className="text-slate-300" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </Card>

      <Card padding="lg" className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <Heading level={3} size="text-base">
            Recent Transactions
          </Heading>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/wallet/transactions')}
            trailingIcon={ArrowRight}
          >
            View all
          </Button>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No transactions yet"
              description="Your wallet transactions will appear here."
            />
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <WalletTransactionCard
                  key={tx.id}
                  transaction={tx}
                  currency={data?.currency || 'USD'}
                  onClick={() => navigate(`/wallet/transactions/${tx.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default WalletOverview;