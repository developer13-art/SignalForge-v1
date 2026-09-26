import React, { useCallback, useEffect, useState } from 'react';
import { FileText, RefreshCw, Loader2, Plus, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormField from '../../components/forms/FormField';

const DocumentTypes = function DocumentTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/document-types', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setTypes(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const handleAdd = useCallback(async () => {
    if (!form.name) {
      return;
    }

    try {
      const response = await fetch('/api/compliance/document-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setAdding(false);
        setForm({ name: '', description: '' });
        fetchTypes();
      }
    } catch (_err) {
      // silent
    }
  }, [form, fetchTypes]);

  const handleRemove = useCallback(async () => {
    if (!removing) {
      return;
    }
    try {
      await fetch(`/api/compliance/document-types/${removing.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setRemoving(null);
      fetchTypes();
    } catch (_err) {
      // silent
    }
  }, [removing, fetchTypes]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <FileText size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Document Types
            </Heading>
            <Text color="muted" className="text-xs">
              Supported identity document types for KYC verification
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTypes}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          {!adding ? (
            <Button variant="primary" size="sm" onClick={() => setAdding(true)} leadingIcon={Plus}>
              Add Type
            </Button>
          ) : null}
        </div>
      </div>

      <Card padding="lg" className="mt-6">
        {adding ? (
          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-4">
              <FormField label="Document Type Name" required>
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="e.g. National Identity Card"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>

              <FormField label="Description">
                {({ id }) => (
                  <textarea
                    id={id}
                    rows={2}
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Short description"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAdd}>
                Save
              </Button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : types.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No document types"
            description="Add supported identity document types."
          />
        ) : (
          <ul className="space-y-3">
            {types.map((type) => (
              <li
                key={type.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{type.name}</p>
                    <Badge variant={type.active ? 'success' : 'neutral'} size="xs">
                      {type.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {type.description ? (
                    <p className="mt-1 text-xs text-slate-500">{type.description}</p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setRemoving(type)}
                  aria-label="Remove"
                  className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        variant="danger"
        title="Remove document type"
        description={
          removing
            ? `Are you sure you want to remove "${removing.name}"? Existing applications using this type remain valid.`
            : ''
        }
        confirmLabel="Remove"
      />
    </Container>
  );
};

export default DocumentTypes;