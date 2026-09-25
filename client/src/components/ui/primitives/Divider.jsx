import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const ORIENTATIONS = {
  horizontal: 'h-px w-full',
  vertical: 'w-px h-full self-stretch',
};

const VARIANTS = {
  solid: 'bg-slate-200',
  dashed: 'border-t border-dashed border-slate-300',
  dotted: 'border-t border-dotted border-slate-300',
  dark: 'bg-slate-700',
  light: 'bg-slate-100',
  primary: 'bg-indigo-200',
};

const SPACING = {
  none: '',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
  xl: 'my-8',
};

const Divider = forwardRef(function Divider(
  {
    orientation = 'horizontal',
    variant = 'solid',
    spacing = 'md',
    label,
    labelPosition = 'center',
    className = '',
    ...rest
  },
  ref
) {
  const orientationClass = ORIENTATIONS[orientation] || ORIENTATIONS.horizontal;
  const variantClass = VARIANTS[variant] || VARIANTS.solid;
  const spacingClass = orientation === 'horizontal' ? SPACING[spacing] || SPACING.md : '';

  if (!label || orientation === 'vertical') {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={[orientationClass, variantClass, spacingClass, className]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
    );
  }

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={['flex items-center gap-3', spacingClass, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {labelPosition !== 'left' ? (
        <div className={['flex-1', variantClass].filter(Boolean).join(' ')} />
      ) : null}

      <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>

      {labelPosition !== 'right' ? (
        <div className={['flex-1', variantClass].filter(Boolean).join(' ')} />
      ) : null}
    </div>
  );
});

Divider.propTypes = {
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  variant: PropTypes.oneOf(['solid', 'dashed', 'dotted', 'dark', 'light', 'primary']),
  spacing: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  label: PropTypes.node,
  labelPosition: PropTypes.oneOf(['left', 'center', 'right']),
  className: PropTypes.string,
};

export default Divider;