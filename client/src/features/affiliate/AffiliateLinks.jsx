import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, ArrowLeft, Loader2, RefreshCw, Copy, Check, Plus, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const AffiliateLinks = function AffiliateLinks() {
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [removing, setRemoving] = useState(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/affiliate/links', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setLinks(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCopy = useCallback(async (id, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (_err) {
      // silent
    }
  }, []);

  const handleCreate = useCallback(async () => {
    try {
      const response = await fetch('/api/affiliate/links', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        fetchLinks();
      }
    } catch (_err) {
      // silent
    }
  }, [fetchLinks]);

  const handleRemove = useCallback(async () => {
    if (!removing) {
      return;
    }
    try {
      await fetch(`/api/affiliate/links/${removing.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setRemoving(null);
      fetchLinks();
    } catch (_err) {
      // silent
    }
  }, [removing, fetchLinks]);

  const handleBack = useCallback(() => navigate('/affiliate'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchLinks}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreate} leadingIcon={Plus}>
            Create Link
          </Button>
        </div>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Link2 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Affiliate Links
            </Heading>
            <Text color="muted" className="text-xs">
              Manage your affiliate links and track their performance
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : links.length === 0 ? (
            <EmptyState
              icon={Link2}
              title="No affiliate links yet"
              description="Create your first affiliate link to start tracking referrals."
              action={
                <Button variant="primary" onClick={handleCreate} leadingIcon={Plus}>
                  Create Link
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {links.map((link) => (
                <li
                  key={link.id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {link.name || 'Affiliate Link'}
                        </p>
                        <Badge variant={link.active ? 'success' : 'neutral'} size="xs">
                          {link.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Created {link.createdAt}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRemoving(link)}
                      className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
                    <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">
                      {link.url}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(link.id, link.url)}
                      aria-label="Copy"
                      className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {copied === link.id ? (
                        <Check size={14} className="text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy size={14} aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3 text-xs">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Clicks
                      </p>
                      <p className="mt-0.5 font-semibold text-slate-800">
                        {link.clicks || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Signups
                      </p>
                      <p className="mt-0.5 font-semibold text-slate-800">
                        {link.signups || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Revenue
                      </p>
                      <p className="mt-0.5 font-semibold text-emerald-600">
                        ${link.revenue || 0}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        variant="danger"
        title="Delete affiliate link"
        description="Are you sure you want to delete this affiliate link? Any existing referrals remain attributed."
        confirmLabel="Delete"
      />
    </Container>
  );
};

export default AffiliateLinks;