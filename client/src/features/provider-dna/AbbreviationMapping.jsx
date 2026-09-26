import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Loader2, RefreshCw, Plus, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const AbbreviationMapping = function AbbreviationMapping() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ abbreviation: '', meaning: '' });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/provider-dna/abbreviations', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setItems(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = useCallback(async () => {
    if (!form.abbreviation || !form.meaning) {
      return;
    }

    try {
      const response = await fetch('/api/ai/provider-dna/abbreviations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setForm({ abbreviation: '', meaning: '' });
        setAdding(false);
        fetchItems();
      }
    } catch (_err) {
      // silent
    }
  }, [form, fetchItems]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        await fetch(`/api/ai/provider-dna/abbreviations/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        fetchItems();
      } catch (_err) {
        // silent
      }
    },
    [fetchItems],
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
              <BookOpen size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Abbreviation Mapping
              </Heading>
              <Text color="muted" className="text-xs">
                Provider-specific abbreviations and their meanings
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchItems}
              disabled={loading}
              leadingIcon={loading ? Loader2 : RefreshCw}
            >
              Refresh
            </Button>
            {!adding ? (
              <Button variant="primary" size="sm" onClick={() => setAdding(true)} leadingIcon={Plus}>
                Add Abbreviation
              </Button>
            ) : null}
          </div>
        </div>

        {adding ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-600">Abbreviation</label>
                <input
                  type="text"
                  value={form.abbreviation}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, abbreviation: event.target.value }))
                  }
                  placeholder="e.g. SP"
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Meaning</label>
                <input
                  type="text"
                  value={form.meaning}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, meaning: event.target.value }))
                  }
                  placeholder="e.g. Secure Profit"
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAdd}>
                Save
              </Button>
            </div>
          </div>
        ) : null}

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No abbreviations learned"
            description="Abbreviations will be learned as messages contain them."
          />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                    &quot;{item.abbreviation}&quot;
                  </span>
                  <span className="text-xs text-slate-400">means</span>
                  <span className="text-sm font-medium text-slate-900">{item.meaning}</span>
                  {item.providerName ? (
                    <Badge variant="neutral" size="xs">
                      {item.providerName}
                    </Badge>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
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

export default AbbreviationMapping;