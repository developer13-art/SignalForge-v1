import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Loader2, CheckCircle2, Shield, ExternalLink, Copy, Check } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Alert from '../../components/feedback/Alert';
import WalletConnectButton from '../../components/domain/solana/WalletConnectButton';
import SolanaWalletCard from '../../components/domain/solana/SolanaWalletCard';
import SiwsLoginButton from '../../components/domain/solana/SiwsLoginButton';

const SolanaWalletConnect = function SolanaWalletConnect() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      if (typeof window !== 'undefined' && window.solana) {
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();

        const apiResponse = await fetch('/api/solana/wallet/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ publicKey }),
        });

        const payload = await apiResponse.json();

        if (!apiResponse.ok) {
          setError(payload?.error?.message || 'Failed to connect wallet');
          return;
        }

        fetchWallet();
      } else {
        setError('Solana wallet extension not detected. Please install Phantom, Solflare, or Backpack.');
      }
    } catch (_err) {
      setError('Unable to connect to wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  }, [fetchWallet]);

  const handleDisconnect = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.solana) {
        await window.solana.disconnect();
      }
      await fetch('/api/solana/wallet', {
        method: 'DELETE',
        credentials: 'include',
      });
      setWallet(null);
    } catch (_err) {
      // silent
    }
  }, []);

  const handleVerify = useCallback(async () => {
    setVerifying(true);
    setError(null);
    try {
      const response = await fetch('/api/solana/wallet/verify', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Verification failed');
        return;
      }

      fetchWallet();
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setVerifying(false);
    }
  }, [fetchWallet]);

  const handleCopy = useCallback(async () => {
    if (!wallet?.address) {
      return;
    }
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {
      // silent
    }
  }, [wallet]);

  const handleViewExplorer = useCallback((address) => {
    window.open(`https://explorer.solana.com/address/${address}`, '_blank');
  }, []);

  const handleBack = useCallback(() => navigate('/settings'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Wallet size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Connect Solana Wallet
            </Heading>
            <Text color="muted" className="text-xs">
              Link your Solana wallet to enable on-chain reputation and provenance
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
        ) : wallet ? (
          <div className="space-y-4">
            <SolanaWalletCard
              wallet={wallet}
              onCopy={handleCopy}
              onViewExplorer={handleViewExplorer}
              onDisconnect={handleDisconnect}
              onVerify={!wallet.verified ? handleVerify : undefined}
              loading={verifying}
            />

            {!wallet.verified ? (
              <SiwsLoginButton
                onSignIn={handleVerify}
                label="Sign In With Solana"
                disabled={verifying}
              />
            ) : null}
          </div>
        ) : (
          <div className="space-y-6">
            <Alert variant="info" size="sm">
              <p className="flex items-start gap-2 text-xs">
                <Shield size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Connecting your wallet is optional and secure. SignalForge never has access to
                  your private keys or funds. Wallet connection is used only for identity
                  verification and on-chain attestations.
                </span>
              </p>
            </Alert>

            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800">
                Supported Wallet Providers
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Phantom, Solflare, Backpack, and any Wallet Standard compliant wallet
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleConnect}
                disabled={connecting}
                leadingIcon={connecting ? Loader2 : Wallet}
              >
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default SolanaWalletConnect;