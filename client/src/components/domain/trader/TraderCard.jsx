import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Star, Users, TrendingUp, Award, Clock } from 'lucide-react';
import Card from '../../common/Card';
import Avatar from '../../common/Avatar';
import TraderStyleBadge from './TraderStyleBadge';

const TraderCard = forwardRef(function TraderCard(
  {
    trader,
    onClick,
    onFollow,
    compact = false,
    showRating = true,
    showStats = true,
    showStyle = true,
    actions,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!trader) {
    return null;
  }

  const {
    name,
    avatar,
    description,
    rating,
    followers,
    winRate,
    monthlyReturn,
    avgRR,
    style,
    verified,
    tags = [],
  } = trader;

  return (
    <Card
      ref={ref}
      variant="default"
      padding={compact ? 'sm' : 'md'}
      hoverable={Boolean(onClick)}
      clickable={Boolean(onClick)}
      onClick={onClick}
      className={className}
      testId={testId}
      {...rest}
    >
      <div className="flex items-start gap-3">
        <Avatar
          size={compact ? 'md' : 'lg'}
          src={avatar}
          name={name}
          alt={name}
          status={verified ? 'verified' : undefined}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900">{name}</h3>
            {showStyle && style ? <TraderStyleBadge style={style} size="xs" /> : null}
          </div>

          {description ? (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{description}</p>
          ) : null}

          {showRating && rating !== undefined ? (
            <div className="mt-2 flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-700">{rating}</span>
              {followers !== undefined ? (
                <span className="ml-2 flex items-center gap-1 text-xs text-slate-500">
                  <Users size={10} aria-hidden="true" />
                  {followers}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {showStats && (winRate !== undefined || monthlyReturn !== undefined || avgRR !== undefined) ? (
        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3">
          {winRate !== undefined ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Win Rate
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-emerald-600">
                <TrendingUp size={12} aria-hidden="true" />
                {winRate}%
              </p>
            </div>
          ) : null}

          {monthlyReturn !== undefined ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Return
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-900">
                <Award size={12} className="text-amber-500" aria-hidden="true" />
                {monthlyReturn}%
              </p>
            </div>
          ) : null}

          {avgRR !== undefined ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Avg R:R
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-900">
                <Clock size={12} aria-hidden="true" />
                {avgRR}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {(actions || onFollow) ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          {actions}
          {onFollow ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onFollow(trader);
              }}
              className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Follow Trader
            </button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
});

TraderCard.propTypes = {
  trader: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
    description: PropTypes.string,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    followers: PropTypes.number,
    winRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    monthlyReturn: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    avgRR: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    style: PropTypes.string,
    verified: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
  onClick: PropTypes.func,
  onFollow: PropTypes.func,
  compact: PropTypes.bool,
  showRating: PropTypes.bool,
  showStats: PropTypes.bool,
  showStyle: PropTypes.bool,
  actions: PropTypes.node,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TraderCard;