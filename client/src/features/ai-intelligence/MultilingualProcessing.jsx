import React, { useCallback, useEffect, useState } from 'react';
import { Languages, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import ProgressBar from '../../components/common/ProgressBar';

const MultilingualProcessing = function MultilingualProcessing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/languages', { credentials: 'include' });
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

  const languages = data?.languages || [];

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Languages size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Multilingual Processing
            </Heading>
            <Text color="muted" className="text-xs">
              Languages detected and supported by the AI engine
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
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Detected Languages
        </Heading>
        <Text color="muted" className="mt-1 text-xs">
          Messages are automatically translated and standardized regardless of the original
          language.
        </Text>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : languages.length === 0 ? (
          <p className="text-sm text-slate-400">No language data available yet.</p>
        ) : (
          <ul className="space-y-3">
            {languages.map((language) => (
              <li key={language.code} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{language.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {language.messagesProcessed} messages processed
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {language.percentage}%
                  </span>
                </div>
                <ProgressBar
                  value={language.percentage}
                  max={100}
                  size="xs"
                  variant="primary"
                  className="mt-2"
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
};

export default MultilingualProcessing;