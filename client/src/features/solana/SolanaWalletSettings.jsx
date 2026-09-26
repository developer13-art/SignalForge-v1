import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Loader2, Save, RefreshCw, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Alert from '../../components/feedback/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SolanaWalletCard from '../../components/domain/solana/SolanaWalletCard';

const SolanaWalletSettings = function SolanaWalletSettings() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/solana/wallet', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok && payload.data?.connected) {
        setWallet(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/solana/wallet/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isPrimary: wallet?.isPrimary,
          allowAttestations: wallet?.allowAttestations,
          publicReputation: wallet?.publicReputation,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to save settings');
        return;
      }

      setSuccess(true);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [wallet]);

  const handleDisconnect = useCallback(async () => {
    try {
      await fetch('/api/solana/wallet', {
        method: 'DELETE',
        credentials: 'include',
      });
      setConfirmDisconnect(false);
      setWallet(null);
      navigate('/solana/wallet-connect');
    } catch (_err) {
      // silent
    }
  }, [navigate]);

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

        {success ? (
          <div className="mt-4">
            <Alert variant="success" size="sm">
              Settings saved.
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
              onViewExplorer={(address) =>
                window.open(`https://explorer.solana.com/address/${address}`, '_blank')
              }
            />

            <Separator spacing="sm" />

            <div className="space-y-3">
              <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
                <input
                  type="checkbox"
                  checked={wallet.isPrimary}
                  onChange={(event) =>
                    setWallet((prev) => ({ ...prev, isPrimary: event.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Primary wallet</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Mark this wallet as the primary identity for on-chain features.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
                <input
                  type="checkbox"
                  checked={wallet.allowAttestations}
                  onChange={(event) =>
                    setWallet((prev) => ({ ...prev, allowAttestations: event.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Allow on-chain attestations
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Enable SignalForge to write certifications and reputation records on-chain
                    using this wallet.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
                <input
                  type="checkbox"
                  checked={wallet.publicReputation}
                  onChange={(event) =>
                    setWallet((prev) => ({ ...prev, publicReputation: event.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Publicly display reputation
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Show your on-chain reputation on your public provider profile.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmDisconnect(true)}
                leadingIcon={Trash2}
              >
                Disconnect Wallet
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
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