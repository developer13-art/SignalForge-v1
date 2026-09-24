import React, { forwardRef, useCallback } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  sm: { container: 'p-0.5', item: 'px-2.5 py-1 text-xs', icon: 12, radius: 'rounded' },
  md: { container: 'p-1', item: 'px-3 py-1.5 text-sm', icon: 14, radius: 'rounded-md' },
  lg: { container: 'p-1', item: 'px-4 py-2 text-base', icon: 16, radius: 'rounded-md' },
};

const VARIANTS = {
  default: {
    container: 'bg-slate-100',
    active: 'bg-white text-slate-900 shadow-sm',
    inactive: 'text-slate-600 hover:text-slate-900',
  },
  primary: {
    container: 'bg-slate-100',
    active: 'bg-indigo-600 text-white shadow-sm',
    inactive: 'text-slate-600 hover:text-slate-900',
  },
  dark: {
    container: 'bg-slate-800',
    active: 'bg-slate-900 text-white shadow-sm',
    inactive: 'text-slate-300 hover:text-white',
  },
};

const SegmentedControl = forwardRef(function SegmentedControl(
  {
    options = [],
    value,
    defaultValue,
    onChange,
    variant = 'default',
    size = 'md',
    fullWidth = false,
    disabled = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(
    defaultValue !== undefined ? defaultValue : options[0]?.value
  );
  const activeValue = isControlled ? value : internalValue;

  const handleSelect = useCallback(
    (optionValue, option) => {
      if (disabled || option.disabled) {
        return;
      }
      if (!isControlled) {
        setInternalValue(optionValue);
      }
      if (onChange) {
        onChange(optionValue, option);
      }
    },
    [disabled, isControlled, onChange]
  );

  const sizeConfig = SIZES[size] || SIZES.md;
  const variantConfig = VARIANTS[variant] || VARIANTS.default;

  return (
    <div
      ref={ref}
      role="tablist"
      className={[
        'inline-flex items-center',
        variantConfig.container,
        sizeConfig.container,
        sizeConfig.radius,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {options.map((option) => {
        const isActive = option.value === activeValue;
        const Icon = option.icon;
        const isDisabled = disabled || option.disabled;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={isDisabled}
            onClick={() => handleSelect(option.value, option)}
            className={[
              'inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1',
              sizeConfig.item,
              sizeConfig.radius,
              fullWidth ? 'flex-1' : '',
              isActive ? variantConfig.active : variantConfig.inactive,
              isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {Icon ? <Icon size={sizeConfig.icon} aria-hidden="true" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
});

SegmentedControl.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.node.isRequired,
      icon: PropTypes.elementType,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'primary', 'dark']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SegmentedControl;
export { VARIANTS as SEGMENTED_CONTROL_VARIANTS, SIZES as SEGMENTED_CONTROL_SIZES };