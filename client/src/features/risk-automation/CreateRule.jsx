import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Zap, ArrowLeft, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import RuleBuilder from '../../components/domain/automation/RuleBuilder';

const CreateRule = function CreateRule() {
  const navigate = useNavigate();
  const { ruleId } = useParams();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(Boolean(ruleId));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ruleId) {
      return;
    }

    const fetchRule = async () => {
      try {
        const response = await fetch(`/api/automation/rules/${ruleId}`, {
          credentials: 'include',
        });
        const payload = await response.json();
        if (response.ok) {
          setInitial(payload.data);
        }
      } catch (_err) {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchRule();
  }, [ruleId]);

  const handleSubmit = useCallback(
    async (values) => {
      setSubmitting(true);
      try {
        const url = ruleId ? `/api/automation/rules/${ruleId}` : '/api/automation/rules';
        const method = ruleId ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(values),
        });

        if (response.ok) {
          navigate('/risk/automation');
        }
      } catch (_err) {
        // silent
      } finally {
        setSubmitting(false);
      }
    },
    [ruleId, navigate],
  );

  const handleBack = useCallback(() => navigate('/risk/automation'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Zap size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              {ruleId ? 'Edit Rule' : 'Create Rule'}
            </Heading>
            <Text color="muted" className="text-xs">
              Define an IF/THEN rule that runs after risk approval
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : (
            <RuleBuilder
              defaultValues={initial}
              onSubmit={handleSubmit}
              onCancel={handleBack}
              submitting={submitting}
            />
          )}
        </div>
      </Card>
    </Container>
  );
};

export default CreateRule;