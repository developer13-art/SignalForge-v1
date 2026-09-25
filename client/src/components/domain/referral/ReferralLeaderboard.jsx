import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import Card from '../../common/Card';
import Avatar from '../../common/Avatar';

const RANK_CONFIG = {
  1: { icon: Crown, color: 'text-amber-500', bg: 'bg-amber-50' },
  2: { icon: Trophy, color: 'text-slate-500', bg: 'bg-slate-100' },
  3: { icon: Medal, color: 'text-amber-700', bg: 'bg-amber-100/50' },
};

function rankConfig(rank) {
  return (
    RANK_CONFIG[rank] || { icon: Award, color: 'text-slate-400', bg: 'bg-slate-50' }
  );
}

const ReferralLeaderboard = forwardRef(function ReferralLeaderboard(
  {
    entries = [],
    currentUserId,
    currency = 'USD',
    period,
    maxEntries,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const visibleEntries =
    typeof maxEntries === 'number' && maxEntries > 0 ? entries.slice(0, maxEntries) : entries;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Referral Leaderboard
          </h3>
          {period ? (
            <p className="mt-0.5 text-xs text-slate-500">Top referrers for {period}</p>
          ) : null}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Trophy size={18} aria-hidden="true" />
        </span>
      </div>

      {visibleEntries.length === 0 ? (
        <p className="mt-6 text-center text-xs text-slate-400">
          Leaderboard data will appear here soon.
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {visibleEntries.map((entry, index) => {
            const rank = entry.rank || index + 1;
            const config = rankConfig(rank);
            const RankIcon = config.icon;
            const isCurrentUser = currentUserId && entry.userId === currentUserId;

            return (
              <li
                key={entry.id || entry.userId || index}
                className={[
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                  isCurrentUser
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span
                  className={[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    config.bg,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <RankIcon size={14} className={config.color} aria-hidden="true" />
                </span>

                <span className="w-6 text-center text-sm font-bold text-slate-500">
                  {rank}
                </span>

                <Avatar
                  size="sm"
                  src={entry.avatar}
                  name={entry.name}
                  alt={entry.name}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {entry.name}
                    {isCurrentUser ? (
                      <span className="ml-2 text-[10px] font-medium text-indigo-600">(You)</span>
                    ) : null}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {entry.referrals || 0} referrals
                  </p>
                </div>

                <p className="shrink-0 text-sm font-bold text-emerald-600">
                  {currency} {entry.earnings || 0}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
});

ReferralLeaderboard.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      rank: PropTypes.number,
      name: PropTypes.string,
      avatar: PropTypes.string,
      referrals: PropTypes.number,
      earnings: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
  period: PropTypes.string,
  maxEntries: PropTypes.number,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ReferralLeaderboard;