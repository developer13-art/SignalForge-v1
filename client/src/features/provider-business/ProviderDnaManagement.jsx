import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dna, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import ProviderDnaCard from '../../components/domain/provider/ProviderDnaCard';
import ErrorState from '../../components/common/ErrorState';

const ProviderDnaManagement = function ProviderDnaManagement() {
  const navigate = useNavigate();
  const [dna, setDna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDna = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/provider-business/dna', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load Provider DNA');
        return;
      }
      setDna(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDna();
  }, [fetchDna]);

  const handleBack = useCallback(() => navigate('/provider'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchDna}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Dna size={20} aria-hidden="true" />
        </span>
        <div>
          <Heading level={1} size="text-2xl">
            Provider DNA
          </Heading>
          <Text color="muted" className="text-xs">
            How the platform has learned your signal style
          </Text>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : error ? (
          <Card padding="lg">
            <ErrorState title="Failed to load" description={error} onRetry={fetchDna} />
          </Card>
        ) : (
          <ProviderDnaCard dna={dna} showRules showConfidence showLanguage />
        )}
      </div>
    </Container>
  );
};

export default ProviderDnaManagement;