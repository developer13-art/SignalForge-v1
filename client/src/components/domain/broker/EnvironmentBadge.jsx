import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Circle, Radio } from 'lucide-react';

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 8 },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 10 },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 12 },
  lg: { container: 'gap-2 px-3 py-1.5 text-base', icon: 14 },
};

const VARIANTS = {
  live: {
    label: 'LIVE',
    container: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  demo: {
    label: 'DEMO',
    container: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
  testnet: {
    label: 'TESTNET',
    container: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
};

const EnvironmentBadge = forwardRef(function EnvironmentBadge(
  {
    environment = 'live',
    size = 'sm',
    showIcon = true,
    showLabel = true,
    showDot = true,
    pulse = true,
    bordered = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const config = VARIANTS[environment] || VARIANTS.live;
  const sizeConfig = SIZES[size] || SIZES.sm;

  return (
    <span
      ref={ref}
      role="status"
      aria-label={`Trading environment: ${config.label}`}
      className={[
        'inline-flex items-center font-bold uppercase tracking-wide rounded',
        bordered ? 'border' : '',
        config.container,
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon && !showDot ? (
        <Radio size={sizeConfig.icon} aria-hidden="true" />
      ) : null}

      {showDot ? (
        <span
          className={[
            'rounded-full',
            config.dot,
            pulse ? 'animate-pulse' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            width: `${sizeConfig.icon}px`,
            height: `${sizeConfig.icon}px`,
          }}
          aria-hidden="true"
        />
      ) : null}

      {showLabel ? config.label : null}
    </span>
  );
});

EnvironmentBadge.propTypes = {
  environment: PropTypes.oneOf(['live', 'demo', 'testnet']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showLabel: PropTypes.bool,
  showDot: PropTypes.bool,
  pulse: PropTypes.bool,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default EnvironmentBadge;
export { VARIANTS as ENVIRONMENT_BADGE_VARIANTS };