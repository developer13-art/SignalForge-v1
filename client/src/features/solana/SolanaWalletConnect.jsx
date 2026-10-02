import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bs58 from 'bs58';
import { Wallet, ArrowLeft, Loader2, Shield, ExternalLink, Copy, Check } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Alert from '../../components/feedback/Alert';
import SolanaWalletCard from '../../components/domain/solana/SolanaWalletCard';
import SiwsLoginButton from '../../components/domain/solana/SiwsLoginButton';
import { authenticatedFetch as fetch } from '../../api/authenticated-fetch.js';

function toDisplayWallet(wallet) {
  if (!wallet) {
    return null;
  }

  return {
    ...wallet,
    address: wallet.walletAddress || wallet.address,
    name: wallet.label || wallet.name || 'Solana Wallet',
    verified: Boolean(wallet.verifiedAt || wallet.verified),
    connectedAt: wallet.createdAt || wallet.connectedAt,
  };
}

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
      const response = await fetch('/api/solana/wallets/primary');
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Failed to load Solana wallet');
      }
      setWallet(toDisplayWallet(payload?.data?.wallet || payload?.wallet));
    } catch (requestError) {
      setError(requestError.message || 'Failed to load Solana wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const signAndLinkWallet = useCallback(async (walletAddress, isPrimary = false) => {
    const provider = typeof window !== 'undefined' ? window.solana : null;
    if (!provider?.signMessage) {
      throw new Error('A Solana wallet with message-signing support is required');
    }

    const challengeResponse = await fetch('/api/solana/wallets/siws/begin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress }),
    });
    const challengePayload = await challengeResponse.json().catch(() => null);
    if (!challengeResponse.ok) {
      throw new Error(challengePayload?.error?.message || 'Failed to begin wallet verification');
    }

    const challenge = challengePayload?.data || challengePayload;
    const signedMessage = await provider.signMessage(
      new TextEncoder().encode(challenge.message),
      'utf8',
    );
    const signature = signedMessage?.signature || signedMessage;
    const signatureBase58 = bs58.encode(signature);

    const completeResponse = await fetch('/api/solana/wallets/siws/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        message: challenge.message,
        signatureBase58,
        isPrimary,
      }),
    });
    const completePayload = await completeResponse.json().catch(() => null);
    if (!completeResponse.ok) {
      throw new Error(completePayload?.error?.message || 'Failed to link wallet');
    }

    setWallet(toDisplayWallet(completePayload?.data?.wallet || completePayload?.wallet));
  }, []);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const provider = typeof window !== 'undefined' ? window.solana : null;
      if (!provider?.connect) {
        throw new Error('Solana wallet extension not detected. Please install Phantom or a compatible wallet.');
      }
      const response = await provider.connect();
      const walletAddress = response?.publicKey?.toString() || provider.publicKey?.toString();
      if (!walletAddress) {
        throw new Error('The wallet did not provide a public address');
      }
      await signAndLinkWallet(walletAddress, true);
    } catch (connectError) {
      setError(connectError.message || 'Unable to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  }, [signAndLinkWallet]);

  const handleDisconnect = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.solana) {
        await window.solana.disconnect();
      }
      if (wallet?.walletId) {
        await fetch(`/api/solana/wallets/${wallet.walletId}`, {
        method: 'DELETE',
        });
      }
      setWallet(null);
    } catch (disconnectError) {
      setError(disconnectError.message || 'Failed to disconnect wallet');
    }
  }, [wallet]);

  const handleVerify = useCallback(async () => {
    setVerifying(true);
    setError(null);
    try {
      if (!wallet?.address) {
        throw new Error('No wallet is available to verify');
      }
      await signAndLinkWallet(wallet.address, wallet.isPrimary);
    } catch (verifyError) {
      setError(verifyError.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  }, [wallet, signAndLinkWallet]);

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