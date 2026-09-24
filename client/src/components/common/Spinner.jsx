import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  xs: { spinner: 12, border: 2 },
  sm: { spinner: 16, border: 2 },
  md: { spinner: 20, border: 2 },
  lg: { spinner: 24, border: 3 },
  xl: { spinner: 32, border: 3 },
  '2xl': { spinner: 48, border: 4 },
};

const COLORS = {
  primary: 'border-indigo-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  current: 'border-current border-t-transparent',
  slate: 'border-slate-400 border-t-transparent',
  success: 'border-emerald-600 border-t-transparent',
  warning: 'border-amber-500 border-t-transparent',
  danger: 'border-rose-600 border-t-transparent',
};

const Spinner = forwardRef(function Spinner(
  {
    size = 'md',
    color = 'primary',
    thickness,
    label,
    showLabel = false,
    inline = false,
    className = '',
    labelClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;
  const borderWidth = thickness || sizeConfig.border;
  const colorClass = COLORS[color] || COLORS.primary;

  const spinnerStyle = {
    width: `${sizeConfig.spinner}px`,
    height: `${sizeConfig.spinner}px`,
    borderWidth: `${borderWidth}px`,
  };

  const spinner = (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading'}
      className={[
        'inline-block animate-spin rounded-full border-solid',
        colorClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={spinnerStyle}
      data-testid={testId}
      {...rest}
    >
      {!showLabel ? <span className="sr-only">{label || 'Loading'}</span> : null}
    </span>
  );

  if (showLabel) {
    return (
      <div
        className={['flex items-center gap-2', inline ? 'inline-flex' : 'flex'].filter(Boolean).join(' ')}
      >
        {spinner}
        <span className={['text-sm font-medium text-slate-600', labelClassName].filter(Boolean).join(' ')}>
          {label || 'Loading'}
        </span>
      </div>
    );
  }

  return spinner;
});

Spinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  color: PropTypes.oneOf([
    'primary',
    'white',
    'current',
    'slate',
    'success',
    'warning',
    'danger',
  ]),
  thickness: PropTypes.number,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  inline: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default Spinner;
export { SIZES as SPINNER_SIZES, COLORS as SPINNER_COLORS };