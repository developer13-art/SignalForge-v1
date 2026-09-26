import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';

const STATUS_CONFIG = {
  pass: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  warn: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  fail: { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
};

const RiskRules = function RiskRules() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/rules', { credentials: 'include' });
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

  const handleBack = useCallback(() => navigate('/risk'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Shield size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Risk Rules
              </Heading>
              <Text color="muted" className="text-xs">
                Current status of every risk check enforced on your account
              </Text>
            </div>
          </div>

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

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : rules.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No risk rules configured"
            description="Configure your risk profile to enable protective rules."
          />
        ) : (
          <ul className="space-y-2">
            {rules.map((rule) => {
              const config = STATUS_CONFIG[rule.status] || STATUS_CONFIG.warn;
              const Icon = config.icon;
              return (
                <li
                  key={rule.key}
                  className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3"
                >
                  <span
                    className={[
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      config.bg,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <Icon size={14} className={config.color} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{rule.label}</p>
                    {rule.description ? (
                      <p className="mt-0.5 text-xs text-slate-500">{rule.description}</p>
                    ) : null}
                    {rule.value !== undefined ? (
                      <p className="mt-1 text-xs font-medium text-slate-700">{rule.value}</p>
                    ) : null}
                  </div>
                  <span
                    className={[
                      'shrink-0 text-xs font-semibold capitalize',
                      config.color,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {rule.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </Container>
  );
};

export default RiskRules;