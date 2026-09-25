import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Star, Users, TrendingUp, Award, ShieldCheck } from 'lucide-react';
import Card from '../../common/Card';
import Avatar from '../../common/Avatar';
import ProviderCertificationBadge from './ProviderCertificationBadge';
import ProviderSolanaBadge from './ProviderSolanaBadge';

const ProviderCard = forwardRef(function ProviderCard(
  {
    provider,
    onClick,
    onSubscribe,
    compact = false,
    showRating = true,
    showStats = true,
    showCertification = true,
    showSolana = true,
    actions,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!provider) {
    return null;
  }

  const {
    name,
    avatar,
    description,
    verified,
    rating,
    subscribers,
    winRate,
    monthlyReturn,
    certification,
    solanaVerified,
    tags = [],
  } = provider;

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
            {showCertification && certification ? (
              <ProviderCertificationBadge level={certification} size="xs" />
            ) : null}
            {showSolana && solanaVerified ? <ProviderSolanaBadge size="xs" /> : null}
          </div>

          {description ? (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{description}</p>
          ) : null}

          {showRating && rating !== undefined ? (
            <div className="mt-2 flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-700">{rating}</span>
              {subscribers !== undefined ? (
                <span className="ml-2 flex items-center gap-1 text-xs text-slate-500">
                  <Users size={10} aria-hidden="true" />
                  {subscribers}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {showStats && (winRate !== undefined || monthlyReturn !== undefined) ? (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
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
                Monthly Return
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-900">
                <Award size={12} className="text-amber-500" aria-hidden="true" />
                {monthlyReturn}%
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

      {(actions || onSubscribe) ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          {actions}
          {onSubscribe ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSubscribe(provider);
              }}
              className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Subscribe
            </button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
});

ProviderCard.propTypes = {
  provider: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
    description: PropTypes.string,
    verified: PropTypes.bool,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    subscribers: PropTypes.number,
    winRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    monthlyReturn: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    certification: PropTypes.string,
    solanaVerified: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
  onClick: PropTypes.func,
  onSubscribe: PropTypes.func,
  compact: PropTypes.bool,
  showRating: PropTypes.bool,
  showStats: PropTypes.bool,
  showCertification: PropTypes.bool,
  showSolana: PropTypes.bool,
  actions: PropTypes.node,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ProviderCard;