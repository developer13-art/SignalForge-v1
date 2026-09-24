import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  xs: { size: 32, stroke: 3, font: 'text-[10px]' },
  sm: { size: 48, stroke: 4, font: 'text-xs' },
  md: { size: 64, stroke: 5, font: 'text-sm' },
  lg: { size: 80, stroke: 6, font: 'text-base' },
  xl: { size: 120, stroke: 8, font: 'text-lg' },
  '2xl': { size: 160, stroke: 10, font: 'text-xl' },
};

const COLORS = {
  primary: '#4f46e5',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#e11d48',
  info: '#0ea5e9',
  neutral: '#64748b',
};

function getSegmentedColor(value) {
  if (value < 33) {
    return COLORS.danger;
  }
  if (value < 66) {
    return COLORS.warning;
  }
  return COLORS.success;
}

const CircularProgress = forwardRef(function CircularProgress(
  {
    value = 0,
    max = 100,
    size = 'md',
    color = 'primary',
    trackColor = '#e2e8f0',
    thickness,
    rounded = true,
    showValue = false,
    showLabel = false,
    label,
    segmented = false,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;
  const strokeWidth = thickness || sizeConfig.stroke;
  const diameter = sizeConfig.size;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const clampedValue = Math.max(0, Math.min(value, max));
  const percent = max === 0 ? 0 : (clampedValue / max) * 100;
  const offset = circumference - (percent / 100) * circumference;

  const strokeColor = useMemo(() => {
    if (segmented) {
      return getSegmentedColor(percent);
    }
    return COLORS[color] || COLORS.primary;
  }, [segmented, percent, color]);

  const containerStyle = {
    width: `${diameter}px`,
    height: `${diameter}px`,
  };

  return (
    <div
      ref={ref}
      className={['relative inline-flex items-center justify-center', className]
        .filter(Boolean)
        .join(' ')}
      style={containerStyle}
      data-testid={testId}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clampedValue}
      aria-label={label || 'Progress'}
      {...rest}
    >
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap={rounded ? 'round' : 'butt'}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 300ms ease-out, stroke 200ms ease-out',
          }}
        />
      </svg>

      {(showValue || showLabel) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue ? (
            <span className={['font-semibold text-slate-900', sizeConfig.font].join(' ')}>
              {Math.round(percent)}%
            </span>
          ) : null}
          {showLabel && label ? (
            <span className="mt-0.5 text-[10px] font-medium text-slate-500">{label}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

CircularProgress.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info', 'neutral']),
  trackColor: PropTypes.string,
  thickness: PropTypes.number,
  rounded: PropTypes.bool,
  showValue: PropTypes.bool,
  showLabel: PropTypes.bool,
  label: PropTypes.string,
  segmented: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default CircularProgress;
export { SIZES as CIRCULAR_PROGRESS_SIZES, COLORS as CIRCULAR_PROGRESS_COLORS };