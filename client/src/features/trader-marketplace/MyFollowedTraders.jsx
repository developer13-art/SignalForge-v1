import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Loader2, RefreshCw, Settings2, X, ArrowRight } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const MyFollowedTraders = function MyFollowedTraders() {
  const navigate = useNavigate();
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfollowing, setUnfollowing] = useState(null);

  const fetchTraders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/marketplace/traders/following', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setTraders(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTraders();
  }, [fetchTraders]);

  const handleUnfollow = useCallback(async () => {
    if (!unfollowing) {
      return;
    }
    try {
      await fetch(`/api/marketplace/traders/${unfollowing.id}/follow`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setUnfollowing(null);
      fetchTraders();
    } catch (_err) {
      // silent
    }
  }, [unfollowing, fetchTraders]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              My Followed Traders
            </Heading>
            <Text color="muted" className="text-xs">
              Manage the traders whose positions you are copying
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTraders}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/traders')}
            leadingIcon={Users}
          >
            Browse Traders
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : traders.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={Users}
              title="Not following any traders"
              description="Browse the trader marketplace to find strategies to follow."
              action={
                <Button variant="primary" onClick={() => navigate('/traders')}>
                  Browse Traders
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {traders.map((trader) => (
              <Card key={trader.id} padding="lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="md"
                      src={trader.avatar}
                      name={trader.name}
                      alt={trader.name}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{trader.name}</p>
                      <p className="text-xs text-slate-500">
                        Following since {trader.followedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      Active
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/traders/${trader.id}/settings`)}
                      leadingIcon={Settings2}
                    >
                      Settings
                    </Button>
                    <button
                      type="button"
                      onClick={() => setUnfollowing(trader)}
                      className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Unfollow"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Copied Trades
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {trader.copiedTrades || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Open Positions
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {trader.openPositions || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Profit Since Following
                    </p>
                    <p
                      className={[
                        'mt-1 text-sm font-semibold',
                        Number(trader.profitSinceFollowing) >= 0
                          ? 'text-emerald-600'
                          : 'text-rose-600',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      ${trader.profitSinceFollowing || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Copy Mode
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                      {trader.copyMode || 'Proportional'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(unfollowing)}
        onClose={() => setUnfollowing(null)}
        onConfirm={handleUnfollow}
        variant="warning"
        title="Unfollow trader"
        description={
          unfollowing
            ? `Are you sure you want to stop copying ${unfollowing.name}? Existing positions are not closed automatically.`
            : ''
        }
        confirmLabel="Unfollow"
      />
    </Container>
  );
};

export default MyFollowedTraders;