import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, Plus, Trash2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const ProviderSpecificRules = function ProviderSpecificRules() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/automation/provider-rules', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setRules(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        await fetch(`/api/automation/provider-rules/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        fetchRules();
      } catch (_err) {
        // silent
      }
    },
    [fetchRules],
  );

  const handleBack = useCallback(() => navigate('/risk'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Users size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Provider-Specific Rules
              </Heading>
              <Text color="muted" className="text-xs">
                Rules that override global automation for a specific provider
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
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/risk/automation/create?scope=provider')}
              leadingIcon={Plus}
            >
              Add Rule
            </Button>
          </div>
        </div>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : rules.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No provider-specific rules"
            description="Global automation rules apply to all providers by default."
          />
        ) : (
          <ul className="space-y-2">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{rule.name}</p>
                    <Badge variant="info" size="xs">
                      {rule.providerName}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {rule.trigger} → {rule.action}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(rule.id)}
                  aria-label="Delete"
                  className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
};

export default ProviderSpecificRules;