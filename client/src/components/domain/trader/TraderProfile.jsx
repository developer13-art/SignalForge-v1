import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Star, Users, TrendingUp, Award, Globe, Calendar, MapPin, Clock } from 'lucide-react';
import Card from '../../common/Card';
import Avatar from '../../common/Avatar';
import Separator from '../../common/Separator';
import TraderStyleBadge from './TraderStyleBadge';

const TraderProfile = forwardRef(function TraderProfile(
  {
    trader,
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
    bio,
    verified,
    rating,
    reviews,
    followers,
    winRate,
    monthlyReturn,
    avgRR,
    totalTrades,
    memberSince,
    location,
    website,
    languages,
    style,
    tags = [],
  } = trader;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <Avatar
          size="2xl"
          src={avatar}
          name={name}
          alt={name}
          status={verified ? 'verified' : undefined}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
            {style ? <TraderStyleBadge style={style} size="sm" /> : null}
          </div>

          {description ? (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            {rating !== undefined ? (
              <span className="flex items-center gap-1">
                <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                <strong className="font-semibold text-slate-700">{rating}</strong>
                {reviews !== undefined ? <span>({reviews} reviews)</span> : null}
              </span>
            ) : null}

            {followers !== undefined ? (
              <span className="flex items-center gap-1">
                <Users size={12} aria-hidden="true" />
                {followers} followers
              </span>
            ) : null}

            {memberSince ? (
              <span className="flex items-center gap-1">
                <Calendar size={12} aria-hidden="true" />
                Since {memberSince}
              </span>
            ) : null}

            {location ? (
              <span className="flex items-center gap-1">
                <MapPin size={12} aria-hidden="true" />
                {location}
              </span>
            ) : null}

            {website ? (
              <span className="flex items-center gap-1">
                <Globe size={12} aria-hidden="true" />
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  {website.replace(/^https?:\/\//, '')}
                </a>
              </span>
            ) : null}
          </div>

          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {actions ? <div className="flex shrink-0 flex-col gap-2">{actions}</div> : null}
      </div>

      <Separator spacing="md" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {winRate !== undefined ? (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Win Rate
            </p>
            <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-emerald-600">
              <TrendingUp size={16} aria-hidden="true" />
              {winRate}%
            </p>
          </div>
        ) : null}

        {monthlyReturn !== undefined ? (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Monthly Return
            </p>
            <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-slate-900">
              <Award size={16} className="text-amber-500" aria-hidden="true" />
              {monthlyReturn}%
            </p>
          </div>
        ) : null}

        {avgRR !== undefined ? (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Avg R:R
            </p>
            <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-slate-900">
              <Clock size={16} aria-hidden="true" />
              {avgRR}
            </p>
          </div>
        ) : null}

        {totalTrades !== undefined ? (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Total Trades
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{totalTrades}</p>
          </div>
        ) : null}
      </div>

      {languages && languages.length > 0 ? (
        <>
          <Separator spacing="md" />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Languages
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">{languages.join(', ')}</p>
          </div>
        </>
      ) : null}

      {bio ? (
        <>
          <Separator spacing="md" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            About
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{bio}</p>
        </>
      ) : null}
    </Card>
  );
});

TraderProfile.propTypes = {
  trader: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
    description: PropTypes.string,
    bio: PropTypes.string,
    verified: PropTypes.bool,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    reviews: PropTypes.number,
    followers: PropTypes.number,
    winRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    monthlyReturn: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    avgRR: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    totalTrades: PropTypes.number,
    memberSince: PropTypes.string,
    location: PropTypes.string,
    website: PropTypes.string,
    languages: PropTypes.arrayOf(PropTypes.string),
    style: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
  actions: PropTypes.node,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TraderProfile;