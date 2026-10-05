import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Alert from '../../components/feedback/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SolanaWalletCard from '../../components/domain/solana/SolanaWalletCard';
import { authenticatedFetch as fetch } from '../../api/authenticated-fetch.js';

const SolanaWalletSettings = function SolanaWalletSettings() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/solana/wallets');
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Failed to load Solana wallets');
      }

      const wallets = payload?.data?.wallets || payload?.wallets || [];
      const selectedWallet = wallets.find((entry) => entry.isPrimary) || wallets[0] || null;
      setWallet(
        selectedWallet
          ? {
              ...selectedWallet,
              address: selectedWallet.walletAddress || selectedWallet.address,
              name: selectedWallet.label || selectedWallet.name || 'Solana Wallet',
              verified: Boolean(selectedWallet.verifiedAt || selectedWallet.verified),
              connectedAt: selectedWallet.createdAt || selectedWallet.connectedAt,
            }
          : null,
      );
    } catch (requestError) {
      setError(requestError.message || 'Failed to load Solana wallets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleSetPrimary = useCallback(async () => {
    if (!wallet?.walletId) {
      setError('No wallet is available to update');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/solana/wallets/${wallet.walletId}/set-primary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId: wallet.walletId }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Failed to set primary wallet');
      }

      await fetchWallet();
    } catch (requestError) {
      setError(requestError.message || 'Failed to set primary wallet');
    } finally {
      setSaving(false);
    }
  }, [wallet, fetchWallet]);

  const handleDisconnect = useCallback(async () => {
    try {
      const response = await fetch(`/api/solana/wallets/${wallet.walletId}`, {
        method: 'DELETE',
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Failed to disconnect wallet');
      }

      if (typeof window !== 'undefined' && window.solana) {
        await window.solana.disconnect();
      }
      setConfirmDisconnect(false);
      setWallet(null);
      navigate('/solana/wallet-connect');
    } catch (requestError) {
      setError(requestError.message || 'Failed to disconnect wallet');
    }
  }, [navigate, wallet]);

  const handleBack = useCallback(() => navigate('/settings'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchWallet}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Wallet size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Solana Wallet Settings
            </Heading>
            <Text color="muted" className="text-xs">
              Configure how your wallet is used on SignalForge
            </Text>
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : !wallet ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-500">
              No wallet connected. Connect a Solana wallet to enable these settings.
            </p>
            <Button variant="primary" onClick={() => navigate('/solana/wallet-connect')}>
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <SolanaWalletCard
              wallet={wallet}
              onViewExplorer={(address) => window.open(`https://explorer.solana.com/address/${address}`, '_blank')}
            />

            <Separator spacing="sm" />

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <Button variant="danger" size="sm" onClick={() => setConfirmDisconnect(true)} leadingIcon={Trash2}>
                Disconnect Wallet
              </Button>
              {!wallet.isPrimary ? (
                <Button
                  variant="primary"
                  onClick={handleSetPrimary}
                  disabled={saving}
                  leadingIcon={saving ? Loader2 : Wallet}
                >
                  {saving ? 'Updating...' : 'Set as Primary'}
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        onConfirm={handleDisconnect}
        variant="danger"
        title="Disconnect Solana wallet"
        description="Your wallet will be unlinked from SignalForge. Existing on-chain attestations remain valid."
        confirmLabel="Disconnect"
      />
    </Container>
  );
};

export default SolanaWalletSettings;
