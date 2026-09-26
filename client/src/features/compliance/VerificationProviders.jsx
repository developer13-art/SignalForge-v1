import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw, Loader2, Check, AlertTriangle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Separator from '../../components/common/Separator';

const VerificationProviders = function VerificationProviders() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/verification-providers', {
        credentials: 'include',
      });
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

  const handleSetPrimary = useCallback(
    async (provider) => {
      try {
        await fetch(`/api/compliance/verification-providers/${provider.id}/primary`, {
          method: 'POST',
          credentials: 'include',
        });
        fetchData();
      } catch (_err) {
        // silent
      }
    },
    [fetchData],
  );

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Verification Providers
            </Heading>
            <Text color="muted" className="text-xs">
              Configure KYC verification providers
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

      <Card padding="lg" className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <div className="space-y-4">
            {(data?.providers || []).map((provider) => (
              <div
                key={provider.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{provider.name}</p>
                    {provider.isPrimary ? (
                      <Badge variant="success" size="xs">
                        Primary
                      </Badge>
                    ) : null}
                    <Badge
                      variant={provider.configured ? 'success' : 'warning'}
                      size="xs"
                    >
                      {provider.configured ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{provider.description}</p>

                  {provider.supportedRegions ? (
                    <p className="mt-2 text-[11px] text-slate-500">
                      Supported regions: {provider.supportedRegions.join(', ')}
                    </p>
                  ) : null}
                </div>

                {!provider.isPrimary && provider.configured ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPrimary(provider)}
                    leadingIcon={Check}
                  >
                    Set as Primary
                  </Button>
                ) : null}
              </div>
            ))}

            {(!data?.providers || data.providers.length === 0) && (
              <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-600"
                  aria-hidden="true"
                />
                <p className="text-xs text-amber-800">
                  No verification providers configured yet.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </Container>
  );
};

export default VerificationProviders;