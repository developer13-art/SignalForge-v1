import React, { useCallback, useEffect, useState } from 'react';
import { Activity, RefreshCw, Loader2, Zap, Award, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Timeline from '../../components/data-display/Timeline';

const AiLearningActivity = function AiLearningActivity() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/learning-activity', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setEvents(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const timelineItems = events.map((event) => ({
    key: event.id,
    title: event.title,
    description: event.description,
    time: event.time,
    icon: event.type === 'dna_learned' ? Award : event.type === 'confidence' ? CheckCircle2 : Zap,
    variant:
      event.type === 'dna_learned'
        ? 'success'
        : event.type === 'confidence'
        ? 'info'
        : 'primary',
  }));

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              AI Learning Activity
            </Heading>
            <Text color="muted" className="text-xs">
              Recent improvements to Provider DNA and parsing rules
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchEvents}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No learning activity yet"
            description="The AI will display learning events here as it processes new patterns."
          />
        ) : (
          <Timeline items={timelineItems} />
        )}
      </Card>
    </Container>
  );
};

export default AiLearningActivity;