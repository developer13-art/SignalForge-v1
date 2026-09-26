import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, RefreshCw, Loader2, ExternalLink } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import AttestationCard from '../../components/domain/solana/AttestationCard';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatCard from '../../components/data-display/StatCard';

const SolanaAttestationViewer = function SolanaAttestationViewer() {
  const navigate = useNavigate();
  const [attestations, setAttestations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttestations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/solana/attestations', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load attestations');
        return;
      }
      setAttestations(payload.data?.items || []);
      setSummary(payload.data?.summary);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttestations();
  }, [fetchAttestations]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <BadgeCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              On-Chain Attestations
            </Heading>
            <Text color="muted" className="text-xs">
              All verifiable attestations written on Solana
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAttestations}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Attestations"
          value={summary?.total || 0}
          icon={BadgeCheck}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Certifications"
          value={summary?.certifications || 0}
          icon={BadgeCheck}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="DNA Records"
          value={summary?.dna || 0}
          icon={BadgeCheck}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Reputation"
          value={summary?.reputation || 0}
          icon={BadgeCheck}
          variant="default"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : error ? (
          <ErrorState title="Failed to load" description={error} onRetry={fetchAttestations} />
        ) : attestations.length === 0 ? (
          <EmptyState
            icon={BadgeCheck}
            title="No attestations yet"
            description="Attestations will appear here after provider certifications and DNA records are anchored on-chain."
          />
        ) : (
          <div className="space-y-3">
            {attestations.map((attestation) => (
              <AttestationCard
                key={attestation.id}
                attestation={attestation}
                onViewExplorer={(txSignature) =>
                  window.open(`https://explorer.solana.com/tx/${txSignature}`, '_blank')
                }
                onCopyHash={(hash) => navigator.clipboard.writeText(hash)}
              />
            ))}
          </div>
        )}
      </Card>
    </Container>
  );
};

export default SolanaAttestationViewer;