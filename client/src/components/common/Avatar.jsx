import React, { forwardRef, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  xs: { container: 'h-6 w-6 text-[10px]', ring: 'ring-2' },
  sm: { container: 'h-8 w-8 text-xs', ring: 'ring-2' },
  md: { container: 'h-10 w-10 text-sm', ring: 'ring-2' },
  lg: { container: 'h-12 w-12 text-base', ring: 'ring-2' },
  xl: { container: 'h-16 w-16 text-lg', ring: 'ring-2' },
  '2xl': { container: 'h-20 w-20 text-xl', ring: 'ring-4' },
  '3xl': { container: 'h-24 w-24 text-2xl', ring: 'ring-4' },
};

const STATUS_COLORS = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-400',
  away: 'bg-amber-500',
  busy: 'bg-rose-500',
  verified: 'bg-sky-500',
  premium: 'bg-gradient-to-br from-amber-400 to-amber-600',
  pending: 'bg-amber-500',
  rejected: 'bg-rose-500',
};

const STATUS_SIZES = {
  xs: 'h-2 w-2',
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
  xl: 'h-4 w-4',
  '2xl': 'h-5 w-5',
  '3xl': 'h-5 w-5',
};

const SHAPE_CLASSES = {
  circle: 'rounded-full',
  square: 'rounded-md',
  rounded: 'rounded-lg',
};

/**
 * Derives up to two initials from a display name.
 */
function deriveInitials(name) {
  if (!name || typeof name !== 'string') {
    return '?';
  }
  const cleaned = name.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return '?';
  }
  const parts = cleaned.split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Deterministically picks a background color for a given seed string.
 */
function deriveColor(seed) {
  const palette = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-sky-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-teal-500',
    'bg-fuchsia-500',
    'bg-cyan-500',
    'bg-orange-500',
  ];
  if (!seed) {
    return palette[0];
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000000007;
  }
  return palette[hash % palette.length];
}

const Avatar = forwardRef(function Avatar(
  {
    src,
    alt,
    name,
    size = 'md',
    shape = 'circle',
    status,
    ringColor = 'ring-white',
    bordered = false,
    className = '',
    imgClassName = '',
    fallbackClassName = '',
    onLoad,
    onError,
    testId,
    ...rest
  },
  ref,
) {
  const sizeStyles = SIZES[size] || SIZES.md;
  const shapeClass = SHAPE_CLASSES[shape] || SHAPE_CLASSES.circle;
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [src]);

  const initials = useMemo(() => deriveInitials(name || alt), [name, alt]);
  const fallbackColor = useMemo(() => deriveColor(name || alt || initials), [name, alt, initials]);

  const showImage = Boolean(src) && !imageError;

  const handleError = (event) => {
    setImageError(true);
    if (onError) {
      onError(event);
    }
  };

  const handleLoad = (event) => {
    setImageLoaded(true);
    if (onLoad) {
      onLoad(event);
    }
  };

  const containerClassName = [
    'relative inline-flex items-center justify-center overflow-hidden select-none',
    sizeStyles.container,
    shapeClass,
    bordered ? `ring-1 ring-slate-200` : '',
    'bg-slate-100',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const statusSizeClass = STATUS_SIZES[size] || STATUS_SIZES.md;
  const statusColorClass = STATUS_COLORS[status] || '';

  return (
    <span
      ref={ref}
      className={containerClassName}
      data-testid={testId}
      aria-label={alt || name || 'Avatar'}
      {...rest}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={handleError}
          onLoad={handleLoad}
          draggable={false}
          loading="lazy"
          decoding="async"
          className={[
            'h-full w-full object-cover transition-opacity duration-200',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ) : (
        <span
          className={[
            'flex h-full w-full items-center justify-center font-semibold text-white',
            fallbackColor,
            fallbackClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {initials}
        </span>
      )}

      {status ? (
        <span
          className={[
            'absolute bottom-0 right-0 block rounded-full',
            statusSizeClass,
            statusColorClass,
            sizeStyles.ring,
            ringColor,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        />
      ) : null}
    </span>
  );
});

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']),
  shape: PropTypes.oneOf(['circle', 'square', 'rounded']),
  status: PropTypes.oneOf([
    'online',
    'offline',
    'away',
    'busy',
    'verified',
    'premium',
    'pending',
    'rejected',
  ]),
  ringColor: PropTypes.string,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  imgClassName: PropTypes.string,
  fallbackClassName: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  testId: PropTypes.string,
};

export default Avatar;
export { SIZES as AVATAR_SIZES, STATUS_COLORS as AVATAR_STATUS_COLORS };