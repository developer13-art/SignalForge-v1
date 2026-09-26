import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TradingSessions = function TradingSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/sessions', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setSessions(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleAdd = useCallback(() => {
    setSessions((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, day: 'Monday', startTime: '08:00', endTime: '18:00' },
    ]);
  }, []);

  const handleRemove = useCallback((id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleUpdate = useCallback((id, field, value) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch('/api/risk/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessions }),
      });
      navigate('/risk');
    } catch (_err) {
      // silent
    } finally {
      setSaving(false);
    }
  }, [sessions, navigate]);

  const handleBack = useCallback(() => navigate('/risk'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Clock size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Trading Sessions
              </Heading>
              <Text color="muted" className="text-xs">
                Restrict automated trading to specific time windows
              </Text>
            </div>
          </div>

          <Button variant="primary" size="sm" onClick={handleAdd} leadingIcon={Plus}>
            Add Session
          </Button>
        </div>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              No sessions configured. Automated trading will run 24/7.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="grid grid-cols-1 items-center gap-3 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <select
                  value={session.day}
                  onChange={(event) => handleUpdate(session.id, 'day', event.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={session.startTime}
                  onChange={(event) => handleUpdate(session.id, 'startTime', event.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <input
                  type="time"
                  value={session.endTime}
                  onChange={(event) => handleUpdate(session.id, 'endTime', event.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => handleRemove(session.id)}
                  aria-label="Remove"
                  className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex justify-end border-t border-slate-200 pt-4">
          <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
            {saving ? 'Saving...' : 'Save Sessions'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default TradingSessions;