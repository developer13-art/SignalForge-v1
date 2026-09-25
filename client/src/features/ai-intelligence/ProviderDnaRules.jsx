import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Award, ArrowLeft, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const ProviderDnaRules = function ProviderDnaRules() {
  const navigate = useNavigate();
  const { providerId } = useParams();

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/provider-dna/${providerId}/rules`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setRules(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleDelete = useCallback(
    async (ruleId) => {
      try {
        await fetch(`/api/ai/provider-dna/${providerId}/rules/${ruleId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        fetchRules();
      } catch (_err) {
        // silent
      }
    },
    [providerId, fetchRules],
  );

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
              <Award size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Provider DNA Rules
              </Heading>
              <Text color="muted" className="text-xs">
                Learned term-to-action mappings for this provider
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRules}
              disabled={loading}
              leadingIcon={loading ? Loader2 : RefreshCw}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : rules.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No rules learned yet"
              description="Rules are added automatically as the AI encounters new patterns."
            />
          ) : (
            <ul className="space-y-2">
              {rules.map((rule) => (
                <li
                  key={rule.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                        &quot;{rule.term}&quot;
                      </span>
                      <Badge variant="info" size="xs">
                        {rule.type}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">Action:</span>{' '}
                      {rule.action}
                    </p>
                    {rule.confidence !== undefined ? (
                      <p className="mt-1 text-[11px] text-slate-500">
                        Confidence: {Math.round(rule.confidence * 100)}%
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(rule.id)}
                    aria-label="Delete rule"
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default ProviderDnaRules;