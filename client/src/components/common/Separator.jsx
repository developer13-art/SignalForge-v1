import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const ORIENTATIONS = {
  horizontal: {
    line: 'h-px w-full',
    container: 'flex w-full items-center',
    margin: 'my-4',
  },
  vertical: {
    line: 'w-px h-full',
    container: 'flex h-full flex-col items-center',
    margin: 'mx-4',
  },
};

const VARIANTS = {
  solid: 'bg-slate-200',
  dashed: 'border-dashed border-slate-300',
  dotted: 'border-dotted border-slate-300',
  gradient: 'bg-gradient-to-r from-transparent via-slate-300 to-transparent',
  dark: 'bg-slate-700',
  light: 'bg-slate-100',
};

const Separator = forwardRef(function Separator(
  {
    orientation = 'horizontal',
    variant = 'solid',
    label,
    labelPosition = 'center',
    spacing = 'md',
    className = '',
    lineClassName = '',
    labelClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const orientationConfig = ORIENTATIONS[orientation] || ORIENTATIONS.horizontal;
  const variantClass = VARIANTS[variant] || VARIANTS.solid;

  const spacingClasses = {
    none: '',
    sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
    xl: orientation === 'horizontal' ? 'my-8' : 'mx-8',
  };

  const spacingClass = spacingClasses[spacing] || spacingClasses.md;

  const isDashedOrDotted = variant === 'dashed' || variant === 'dotted';

  const lineClasses = [
    isDashedOrDotted ? '' : 'rounded-full',
    isDashedOrDotted && orientation === 'horizontal' ? 'border-t' : '',
    isDashedOrDotted && orientation === 'vertical' ? 'border-l' : '',
    isDashedOrDotted ? '' : orientationConfig.line,
    isDashedOrDotted ? variantClass : '',
    !isDashedOrDotted ? variantClass : '',
    lineClassName,
  ]
    .filter(Boolean)
    .join(' ');

  if (!label) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={[
          orientationConfig.container,
          spacingClass,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      >
        <div className={lineClasses} />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={[
        'flex items-center gap-3',
        orientation === 'vertical' ? 'flex-col h-full' : '',
        spacingClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {labelPosition !== 'left' ? (
        <div className={[lineClasses, 'flex-1'].filter(Boolean).join(' ')} />
      ) : null}

      <span
        className={[
          'shrink-0 text-xs font-medium uppercase tracking-wider text-slate-500',
          labelClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label}
      </span>

      {labelPosition !== 'right' ? (
        <div className={[lineClasses, 'flex-1'].filter(Boolean).join(' ')} />
      ) : null}
    </div>
  );
});

Separator.propTypes = {
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  variant: PropTypes.oneOf(['solid', 'dashed', 'dotted', 'gradient', 'dark', 'light']),
  label: PropTypes.node,
  labelPosition: PropTypes.oneOf(['left', 'center', 'right']),
  spacing: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  lineClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default Separator;
export { ORIENTATIONS as SEPARATOR_ORIENTATIONS };