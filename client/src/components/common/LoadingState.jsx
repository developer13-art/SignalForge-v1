import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Spinner from './Spinner';
import Skeleton from './Skeleton';

const SIZES = {
  sm: {
    container: 'py-6 px-4',
    spinner: 'sm',
    labelClass: 'text-xs',
    skeletonCount: 3,
  },
  md: {
    container: 'py-10 px-6',
    spinner: 'md',
    labelClass: 'text-sm',
    skeletonCount: 4,
  },
  lg: {
    container: 'py-14 px-8',
    spinner: 'lg',
    labelClass: 'text-base',
    skeletonCount: 5,
  },
};

const LoadingState = forwardRef(function LoadingState(
  {
    label = 'Loading',
    description,
    variant = 'spinner',
    size = 'md',
    fullscreen = false,
    overlay = false,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;

  if (overlay) {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={[
          'absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      >
        <div className="flex flex-col items-center gap-3">
          <Spinner size={sizeConfig.spinner} />
          {label ? (
            <span className={['font-medium text-slate-700', sizeConfig.labelClass].join(' ')}>
              {label}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={label}
        className={[sizeConfig.container, 'w-full space-y-3', className]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      >
        <Skeleton variant="title" width="40%" />
        <Skeleton count={sizeConfig.skeletonCount} variant="text" />
      </div>
    );
  }

  if (variant === 'skeleton-cards') {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={label}
        className={['grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3', className]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
          >
            <Skeleton variant="rect" height={120} />
            <Skeleton variant="title" width="70%" />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="50%" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={[
        'flex flex-col items-center justify-center text-center',
        sizeConfig.container,
        fullscreen ? 'min-h-screen' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <Spinner size={sizeConfig.spinner} />

      {label ? (
        <span
          className={[
            'mt-3 font-medium text-slate-700',
            sizeConfig.labelClass,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </span>
      ) : null}

      {description ? (
        <span className="mt-1 max-w-md text-xs text-slate-500">{description}</span>
      ) : null}
    </div>
  );
});

LoadingState.propTypes = {
  label: PropTypes.string,
  description: PropTypes.string,
  variant: PropTypes.oneOf(['spinner', 'skeleton', 'skeleton-cards']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullscreen: PropTypes.bool,
  overlay: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default LoadingState;
export { SIZES as LOADING_STATE_SIZES };