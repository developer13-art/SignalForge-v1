import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import Card from '../../common/Card';
import Avatar from '../../common/Avatar';

function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
    stars.push(
      <Star        key={i}
        size={12}
        className={
          i <= rating
            ? 'fill-amber-400 text-amber-400'
            : 'text-slate-300'
        }
        aria-hidden="true"
      />
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

const ProviderReviewCard = forwardRef(function ProviderReviewCard(
  {
    review,
    onLike,
    onReply,
    showReply = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!review) {
    return null;
  }

  const { author, avatar, rating, title, body, date, likes, replies } = review;

  return (
    <Card ref={ref} padding="md" className={className} testId={testId} {...rest}>
      <div className="flex items-start gap-3">
        <Avatar size="sm" src={avatar} name={author} alt={author} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{author}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <StarRating rating={rating || 0} />
                {date ? <span className="text-[11px] text-slate-400">{date}</span> : null}
              </div>
            </div>
          </div>

          {title ? (
            <p className="mt-2 text-sm font-semibold text-slate-800">{title}</p>
          ) : null}

          {body ? (
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
          ) : null}

          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            {onLike ? (
              <button
                type="button"
                onClick={() => onLike(review)}
                className="flex items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <ThumbsUp size={12} aria-hidden="true" />
                {likes || 0}
              </button>
            ) : likes !== undefined ? (
              <span className="flex items-center gap-1">
                <ThumbsUp size={12} aria-hidden="true" />
                {likes}
              </span>
            ) : null}

            {showReply && onReply ? (
              <button
                type="button"
                onClick={() => onReply(review)}
                className="flex items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <MessageCircle size={12} aria-hidden="true" />
                Reply
              </button>
            ) : replies !== undefined ? (
              <span className="flex items-center gap-1">
                <MessageCircle size={12} aria-hidden="true" />
                {replies}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
});

ProviderReviewCard.propTypes = {
  review: PropTypes.shape({
    author: PropTypes.string,
    avatar: PropTypes.string,
    rating: PropTypes.number,
    title: PropTypes.string,
    body: PropTypes.string,
    date: PropTypes.string,
    likes: PropTypes.number,
    replies: PropTypes.number,
  }),
  onLike: PropTypes.func,
  onReply: PropTypes.func,
  showReply: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ProviderReviewCard;