import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Loader2, RefreshCw, Plus, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ProviderPromotions = function ProviderPromotions() {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/promotions', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setPromotions(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleRemove = useCallback(async () => {
    if (!removing) {
      return;
    }
    try {
      await fetch(`/api/provider-business/promotions/${removing.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setRemoving(null);
      fetchPromotions();
    } catch (_err) {
      // silent
    }
  }, [removing, fetchPromotions]);

  const handleBack = useCallback(() => navigate('/provider'), [navigate]);

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
            onClick={fetchPromotions}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/provider/promotions/new')}
            leadingIcon={Plus}
          >
            Create Promotion
          </Button>
        </div>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Promotions
            </Heading>
            <Text color="muted" className="text-xs">
              Special offers and discounts to attract subscribers
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : promotions.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No promotions yet"
              description="Create a promotion to attract new subscribers."
              action={
                <Button
                  variant="primary"
                  onClick={() => navigate('/provider/promotions/new')}
                  leadingIcon={Plus}
                >
                  Create Promotion
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {promotions.map((promo) => (
                <Card key={promo.id} padding="lg" variant="subtle">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-slate-900">{promo.name}</p>
                        <Badge variant={promo.active ? 'success' : 'neutral'} size="xs">
                          {promo.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{promo.description}</p>
                      {promo.discount ? (
                        <p className="mt-1 text-xs font-semibold text-emerald-600">
                          {promo.discount}% off
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/provider/promotions/${promo.id}`)}
                      >
                        Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() => setRemoving(promo)}
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        variant="danger"
        title="Delete promotion"
        description={removing ? `Are you sure you want to delete "${removing.name}"?` : ''}
        confirmLabel="Delete"
      />
    </Container>
  );
};

export default ProviderPromotions;