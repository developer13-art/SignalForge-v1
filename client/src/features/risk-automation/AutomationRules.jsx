import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RuleList from '../../components/domain/automation/RuleList';

const AutomationRules = function AutomationRules() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/automation/rules', { credentials: 'include' });
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

  const handleToggle = useCallback(
    async (rule) => {
      try {
        await fetch(`/api/automation/rules/${rule.id}/toggle`, {
          method: 'POST',
          credentials: 'include',
        });
        fetchRules();
      } catch (_err) {
        // silent
      }
    },
    [fetchRules],
  );

  const handleDelete = useCallback(
    async (rule) => {
      try {
        await fetch(`/api/automation/rules/${rule.id}`, {
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

      <div className="mt-4">
        <RuleList
          rules={rules}
          loading={loading}
          onCreate={() => navigate('/risk/automation/create')}
          onToggle={handleToggle}
          onEdit={(rule) => navigate(`/risk/automation/${rule.id}`)}
          onDelete={handleDelete}
          onTest={(rule) => navigate(`/risk/automation/${rule.id}/test`)}
        />
      </div>
    </Container>
  );
};

export default AutomationRules;