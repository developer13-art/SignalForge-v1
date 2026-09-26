import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import WalletBalanceCard from '../../components/domain/wallet/WalletBalanceCard';
import WalletLedgerTable from '../../components/domain/wallet/WalletLedgerTable';

const ReferralWallet = function ReferralWallet() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, ledgerRes] = await Promise.all([
        fetch('/api/referrals/wallet', { credentials: 'include' }),
        fetch('/api/referrals/wallet/ledger', { credentials: 'include' }),
      ]);

      const walletPayload = await walletRes.json();
      const ledgerPayload = await ledgerRes.json();

      if (walletRes.ok) {
        setData(walletPayload.data);
      }
      if (ledgerRes.ok) {
        setEntries(ledgerPayload.data || []);
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

  const handleBack = useCallback(() => navigate('/referrals'), [navigate]);

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
        <WalletBalanceCard
          available={data?.availableBalance || 0}
          pending={data?.pendingBalance || 0}
          lifetimeEarned={data?.lifetimeEarned}
          lifetimeWithdrawn={data?.lifetimeWithdrawn}
          currency="USD"
          loading={loading}
          onWithdraw={() => navigate('/referrals/wallet/withdraw')}
          onViewHistory={() => navigate('/referrals/history')}
        />

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Wallet Ledger
          </Heading>
          <Text color="muted" className="mt-1 text-xs">
            Immutable log of every wallet change
          </Text>

          <div className="mt-4">
            <WalletLedgerTable entries={entries} loading={loading} currency="USD" />
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default ReferralWallet;