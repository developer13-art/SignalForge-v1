import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Languages, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const ProviderLanguageProfile = function ProviderLanguageProfile() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/provider-dna/language', { credentials: 'include' });
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

  const handleBack = useCallback(() => navigate('/ai/provider-dna'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Languages size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Language Profile
              </Heading>
              <Text color="muted" className="text-xs">
                Detected language and writing style per provider
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

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (data?.providers || []).length === 0 ? (
          <EmptyState
            icon={Languages}
            title="No language data"
            description="Language profiles will appear as signals are processed."
          />
        ) : (
          <ul className="space-y-4">
            {data.providers.map((provider) => (
              <li
                key={provider.providerId}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{provider.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {provider.messagesAnalyzed || 0} messages analyzed
                    </p>
                  </div>
                  <Badge variant="primary" size="xs">
                    {provider.primaryLanguage}
                  </Badge>
                </div>

                <div className="mt-3 space-y-2">
                  {(provider.languages || []).map((language) => (
                    <div key={language.code}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-600">{language.name}</span>
                        <span className="font-semibold text-slate-800">{language.percent}%</span>
                      </div>
                      <ProgressBar
                        value={language.percent}
                        max={100}
                        size="xs"
                        variant="primary"
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>

                {provider.styleNotes ? (
                  <p className="mt-3 text-xs text-slate-500">{provider.styleNotes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
};

export default ProviderLanguageProfile;