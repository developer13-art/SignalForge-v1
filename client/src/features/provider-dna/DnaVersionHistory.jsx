import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const DnaVersionHistory = function DnaVersionHistory() {
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/provider-dna/versions', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setVersions(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleBack = useCallback(() => navigate('/ai/provider-dna'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <History size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                DNA Version History
              </Heading>
              <Text color="muted" className="text-xs">
                Full history of improvements to Provider DNA
              </Text>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchVersions}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
        </div>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : versions.length === 0 ? (
          <EmptyState
            icon={History}
            title="No version history"
            description="Version history will appear as your Provider DNA evolves."
          />
        ) : (
          <ol className="relative space-y-4">
            {versions.map((version, index) => (
              <li key={version.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    v{version.number}
                  </span>
                  {index < versions.length - 1 ? (
                    <span
                      className="mt-1 h-full min-h-[2rem] w-0.5 bg-slate-200"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 pb-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{version.title}</p>
                    <time className="text-[11px] text-slate-400">{version.createdAt}</time>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {version.providerName ? (
                      <Badge variant="neutral" size="xs">
                        {version.providerName}
                      </Badge>
                    ) : null}
                    {version.rulesAdded !== undefined ? (
                      <span className="text-[10px] font-medium text-emerald-600">
                        +{version.rulesAdded} rules
                      </span>
                    ) : null}
                    {version.confidenceDelta !== undefined ? (
                      <span
                        className={[
                          'text-[10px] font-medium',
                          version.confidenceDelta >= 0 ? 'text-emerald-600' : 'text-rose-600',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {version.confidenceDelta >= 0 ? '+' : ''}
                        {version.confidenceDelta}% confidence
                      </span>
                    ) : null}
                  </div>

                  {version.description ? (
                    <p className="mt-2 text-xs text-slate-600">{version.description}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </Container>
  );
};

export default DnaVersionHistory;