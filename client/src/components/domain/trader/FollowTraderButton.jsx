import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { UserPlus, UserCheck, UserMinus, Loader2 } from 'lucide-react';

const SIZES = {
  sm: 'px-2.5 py-1 text-xs gap-1.5',
  md: 'px-3 py-1.5 text-sm gap-2',
  lg: 'px-4 py-2 text-base gap-2.5',
};

const VARIANTS = {
  primary: {
    following: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    notFollowing: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  outline: {
    following: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    notFollowing: 'border border-indigo-600 bg-white text-indigo-700 hover:bg-indigo-50',
  },
  ghost: {
    following: 'text-slate-600 hover:bg-slate-100',
    notFollowing: 'text-indigo-600 hover:bg-indigo-50',
  },
};

const FollowTraderButton = forwardRef(function FollowTraderButton(
  {
    following = false,
    onFollow,
    onUnfollow,
    size = 'md',
    variant = 'primary',
    showIcon = true,
    confirmUnfollow = false,
    disabled = false,
    loading = false,
    followLabel = 'Follow',
    followingLabel = 'Following',
    unfollowLabel = 'Unfollow',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [hovering, setHovering] = useState(false);

  const isLoading = loading || internalLoading;
  const sizeClass = SIZES[size] || SIZES.md;
  const variantConfig = VARIANTS[variant] || VARIANTS.primary;

  const stateClass = following ? variantConfig.following : variantConfig.notFollowing;

  const Icon = following ? (hovering && !isLoading ? UserMinus : UserCheck) : UserPlus;

  const label = following
    ? hovering && !isLoading && !confirmUnfollow
      ? unfollowLabel
      : followingLabel
    : followLabel;

  const handleClick = async (event) => {
    if (disabled || isLoading) {
      return;
    }

    try {
      setInternalLoading(true);
      if (following) {
        if (onUnfollow) {
          await onUnfollow(event);
        }
      } else if (onFollow) {
        await onFollow(event);
      }
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
        sizeClass,
        stateClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-pressed={following}
      data-testid={testId}
      {...rest}
    >
      {showIcon ? (
        isLoading ? (
          <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="animate-spin" aria-hidden="true" />
        ) : (
          <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} aria-hidden="true" />
        )
      ) : null}
      {label}
    </button>
  );
});

FollowTraderButton.propTypes = {
  following: PropTypes.bool,
  onFollow: PropTypes.func,
  onUnfollow: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'outline', 'ghost']),
  showIcon: PropTypes.bool,
  confirmUnfollow: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  followLabel: PropTypes.string,
  followingLabel: PropTypes.string,
  unfollowLabel: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default FollowTraderButton;