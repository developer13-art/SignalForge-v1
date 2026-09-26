import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, RefreshCw, Loader2, ExternalLink, ShieldCheck, BadgeCheck, Star } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';

const BADGE_ICONS = {
  certified: BadgeCheck,
  reputation: Star,
  provenance: ShieldCheck,
  default: Award,
};

const OnChainBadgesShowcase = function OnChainBadgesShowcase() {
  const navigate = useNavigate();
  const [badges, setBadges] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/solana/badges', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setBadges(payload.data?.items || []);
        setSummary(payload.data?.summary);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white">
            <Award size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              On-Chain Badges
            </Heading>
            <Text color="muted" className="text-xs">
              Verifiable achievement badges earned through on-chain activity
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchBadges}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Badges"
          value={summary?.total || 0}
          icon={Award}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Certifications"
          value={summary?.certifications || 0}
          icon={BadgeCheck}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Reputation Badges"
          value={summary?.reputation || 0}
          icon={Star}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Provenance Badges"
          value={summary?.provenance || 0}
          icon={ShieldCheck}
          variant="default"
          loading={loading}
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : badges.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={Award}
              title="No on-chain badges yet"
              description="Badges are issued automatically as you build verifiable on-chain reputation."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => {
              const Icon = BADGE_ICONS[badge.type] || BADGE_ICONS.default;
              return (
                <Card key={badge.id} padding="lg">
                  <div className="flex items-start gap-3">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{badge.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{badge.description}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Earned {badge.earnedAt}
                      </p>
                    </div>
                  </div>

                  {badge.txSignature ? (
                    <>
                      <Separator spacing="sm" />
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            `https://explorer.solana.com/tx/${badge.txSignature}`,
                            '_blank',
                          )
                        }
                        className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800"
                      >
                        <ExternalLink size={11} aria-hidden="true" />
                        View on Solana Explorer
                      </button>
                    </>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
};

export default OnChainBadgesShowcase;