import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileCode2, RefreshCw, Loader2, Search } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import ProvenanceViewer from '../../components/domain/solana/ProvenanceViewer';
import EmptyState from '../../components/common/EmptyState';

const SolanaProvenanceExplorer = function SolanaProvenanceExplorer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialHash = searchParams.get('hash') || '';

  const [searchHash, setSearchHash] = useState(initialHash);
  const [provenance, setProvenance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async () => {
    if (!searchHash.trim()) {
      setError('Please enter a processing hash or signal ID');
      return;
    }

    setLoading(true);
    setError(null);
    setProvenance(null);

    try {
      const response = await fetch(`/api/solana/provenance/${searchHash}`, {
        credentials: 'include',
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Provenance record not found');
        return;
      }

      setProvenance(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [searchHash]);

  useEffect(() => {
    if (initialHash) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHash]);

  const handleVerify = useCallback(async () => {
    if (!provenance) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/solana/provenance/${provenance.id}/verify`, {
        method: 'POST',
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setProvenance((prev) => ({ ...prev, ...payload.data }));
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [provenance]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
          <FileCode2 size={20} aria-hidden="true" />
        </span>
        <div>
          <Heading level={1} size="text-2xl">
            AI Signal Provenance Explorer
          </Heading>
          <Text color="muted" className="text-xs">
            Verify the AI processing history of any signal on Solana
          </Text>
        </div>
      </div>

      <Card padding="lg" className="mt-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchHash}
              onChange={(event) => setSearchHash(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="Enter processing hash or signal ID"
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 font-mono text-sm"
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSearch}
            disabled={loading || !searchHash.trim()}
            leadingIcon={loading ? Loader2 : Search}
          >
            Search
          </Button>
        </div>
      </Card>

      <div className="mt-4">
        {error ? (
          <Card padding="lg">
            <EmptyState
              icon={FileCode2}
              title="Provenance not found"
              description={error}
            />
          </Card>
        ) : provenance ? (
          <ProvenanceViewer
            provenance={provenance}
            onVerify={handleVerify}
            onViewExplorer={(txSignature) =>
              window.open(`https://explorer.solana.com/tx/${txSignature}`, '_blank')
            }
            onCopyHash={(hash) => navigator.clipboard.writeText(hash)}
            verifying={loading}
          />
        ) : (
          <Card padding="lg">
            <EmptyState
              icon={FileCode2}
              title="Search for signal provenance"
              description="Enter a signal ID or processing hash to verify its AI processing history."
            />
          </Card>
        )}
      </div>
    </Container>
  );
};

export default SolanaProvenanceExplorer;