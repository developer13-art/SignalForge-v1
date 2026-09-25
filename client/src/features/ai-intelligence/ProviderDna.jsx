import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, RefreshCw, Loader2, ArrowRight, Dna } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataGrid from '../../components/data-display/DataGrid';
import EmptyState from '../../components/common/EmptyState';
import ProviderDnaCard from '../../components/domain/provider/ProviderDnaCard';

const ProviderDna = function ProviderDna() {
  const navigate = useNavigate();
  const [dnas, setDnas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDnas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/provider-dna', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setDnas(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDnas();
  }, [fetchDnas]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Dna size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider DNA
            </Heading>
            <Text color="muted" className="text-xs">
              Learned patterns from each provider's signal style
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchDnas}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-6">
        <DataGrid
          items={dnas}
          loading={loading}
          columns="lg"
          keyExtractor={(item) => item.providerId}
          renderItem={(dna) => (
            <div className="cursor-pointer" onClick={() => navigate(`/ai/provider-dna/${dna.providerId}`)}>
              <ProviderDnaCard dna={dna} compact />
            </div>
          )}
          emptyState={
            <EmptyState
              icon={Award}
              title="No Provider DNA yet"
              description="Provider DNA will appear as providers send signals through your account."
            />
          }
        />
      </div>
    </Container>
  );
};

export default ProviderDna;