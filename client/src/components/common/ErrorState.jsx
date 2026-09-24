import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const SIZES = {
  sm: {
    container: 'py-8 px-4',
    iconWrapper: 'h-12 w-12',
    iconSize: 24,
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    container: 'py-12 px-6',
    iconWrapper: 'h-16 w-16',
    iconSize: 32,
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16 px-8',
    iconWrapper: 'h-20 w-20',
    iconSize: 40,
    title: 'text-lg',
    description: 'text-sm',
  },
};

const VARIANTS = {
  error: {
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  info: {
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
};

const ErrorState = forwardRef(function ErrorState(
  {
    title = 'Something went wrong',
    description = 'We encountered an error while processing your request. Please try again.',
    errorCode,
    errorMessage,
    errorDetails,
    onRetry,
    retryLabel = 'Try again',
    retryLoading = false,
    icon: IconProp,
    size = 'md',
    variant = 'error',
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;
  const variantConfig = VARIANTS[variant] || VARIANTS.error;
  const Icon = IconProp || AlertTriangle;

  return (
    <div
      ref={ref}
      role="alert"
      className={[
        'flex flex-col items-center justify-center text-center',
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <div
        className={[
          'mb-4 flex items-center justify-center rounded-full',
          sizeConfig.iconWrapper,
          variantConfig.iconBg,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Icon
          size={sizeConfig.iconSize}
          className={variantConfig.iconColor}
          aria-hidden="true"
        />
      </div>

      <h3
        className={[
          'font-semibold text-slate-900',
          sizeConfig.title,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {title}
      </h3>

      {description ? (
        <p
          className={[
            'mt-1 max-w-md text-slate-500',
            sizeConfig.description,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {description}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-2 max-w-md text-xs font-medium text-rose-600">{errorMessage}</p>
      ) : null}

      {errorCode ? (
        <p className="mt-1 text-xs text-slate-400">
          Error code: <span className="font-mono">{errorCode}</span>
        </p>
      ) : null}

      {errorDetails ? (
        <details className="mt-4 w-full max-w-md text-left">
          <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
            Technical details
          </summary>
          <pre className="mt-2 overflow-auto rounded-md bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100">
            {typeof errorDetails === 'string'
              ? errorDetails
              : JSON.stringify(errorDetails, null, 2)}
          </pre>
        </details>
      ) : null}

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={retryLoading}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={retryLoading ? 'animate-spin' : ''}
            aria-hidden="true"
          />
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
});

ErrorState.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  errorCode: PropTypes.string,
  errorMessage: PropTypes.string,
  errorDetails: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRetry: PropTypes.func,
  retryLabel: PropTypes.string,
  retryLoading: PropTypes.bool,
  icon: PropTypes.elementType,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['error', 'warning', 'info']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ErrorState;
export { SIZES as ERROR_STATE_SIZES, VARIANTS as ERROR_STATE_VARIANTS };