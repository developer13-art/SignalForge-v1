import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, RefreshCw, Loader2, ExternalLink } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import OnChainVerificationBadge from '../../components/domain/solana/OnChainVerificationBadge';
import ProviderCertificationBadge from '../../components/domain/provider/ProviderCertificationBadge';
import ProgressBar from '../../components/common/ProgressBar';

const SolanaReputation = function SolanaReputation() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/solana/reputation', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
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

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              On-Chain Reputation
            </Heading>
            <Text color="muted" className="text-xs">
              Verifiable reputation records anchored on Solana
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
          Refresh
        </Button>
      </div>

      {loading ? (
        <Card padding="lg" className="mt-6">
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        </Card>
      ) : data ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Reputation Score"
              value={data.reputationScore !== undefined ? data.reputationScore : '—'}
              icon={ShieldCheck}
              variant="success"
              loading={loading}
            />
            <StatCard
              label="Attestations"
              value={data.attestationsCount || 0}
              icon={ShieldCheck}
              variant="primary"
              loading={loading}
            />
            <StatCard
              label="Verifications"
              value={data.verificationsCount || 0}
              icon={ShieldCheck}
              variant="info"
              loading={loading}
            />
            <StatCard
              label="Last Anchored"
              value={data.lastAnchored || '—'}
              icon={ShieldCheck}
              variant="default"
              loading={loading}
            />
          </div>

          <Card padding="lg" className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Heading level={3} size="text-base">
                  Reputation Summary
                </Heading>
                <Text color="muted" className="mt-1 text-xs">
                  Your on-chain reputation status on Solana
                </Text>
              </div>
              {data.verified ? (
                <OnChainVerificationBadge status="verified" size="md" />
              ) : (
                <OnChainVerificationBadge status="pending" size="md" />
              )}
            </div>

            <div className="mt-6 space-y-4">
              {(data.metrics || []).map((metric) => (
                <div key={metric.key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{metric.label}</span>
                    <span className="font-semibold text-slate-900">{metric.value}%</span>
                  </div>
                  <ProgressBar
                    value={metric.value}
                    max={100}
                    size="sm"
                    variant={
                      metric.value >= 80
                        ? 'success'
                        : metric.value >= 60
                        ? 'primary'
                        : metric.value >= 40
                        ? 'warning'
                        : 'danger'
                    }
                    className="mt-1.5"
                  />
                </div>
              ))}
            </div>

            {data.certification ? (
              <div className="mt-6 flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-xs font-medium text-slate-600">
                    Current Certification Level
                  </p>
                  <div className="mt-2">
                    <ProviderCertificationBadge
                      level={data.certification}
                      size="md"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/solana/attestations')}
                  trailingIcon={ExternalLink}
                >
                  View Attestations
                </Button>
              </div>
            ) : null}
          </Card>
        </>
      ) : (
        <Card padding="lg" className="mt-6">
          <Text color="muted">
            Connect a Solana wallet to display your on-chain reputation.
          </Text>
          <div className="mt-4">
            <Button variant="primary" onClick={() => navigate('/solana/wallet-connect')}>
              Connect Wallet
            </Button>
          </div>
        </Card>
      )}
    </Container>
  );
};

export default SolanaReputation;