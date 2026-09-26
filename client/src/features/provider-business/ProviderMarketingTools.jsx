import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Loader2, RefreshCw, Copy, Check, Download } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';

const ProviderMarketingTools = function ProviderMarketingTools() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/marketing', {
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

  const handleCopy = useCallback(async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (_err) {
      // silent
    }
  }, []);

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
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Marketing Tools
            </Heading>
            <Text color="muted" className="text-xs">
              Assets and links to help you promote your provider profile
            </Text>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <Card padding="lg" variant="subtle">
              <Heading level={3} size="text-base">
                Referral Links
              </Heading>

              <div className="mt-4 space-y-3">
                {(data?.links || []).map((link) => (
                  <div key={link.key}>
                    <p className="text-xs font-medium text-slate-600">{link.label}</p>
                    <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2">
                      <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">
                        {link.url}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(link.key, link.url)}
                        aria-label="Copy"
                        className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        {copied === link.key ? (
                          <Check size={14} className="text-emerald-600" aria-hidden="true" />
                        ) : (
                          <Copy size={14} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="lg" variant="subtle">
              <Heading level={3} size="text-base">
                Marketing Assets
              </Heading>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {(data?.assets || []).map((asset) => (
                  <div
                    key={asset.key}
                    className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">{asset.label}</p>
                      <p className="text-[11px] text-slate-500">{asset.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(asset.downloadUrl, '_blank')}
                      leadingIcon={Download}
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default ProviderMarketingTools;