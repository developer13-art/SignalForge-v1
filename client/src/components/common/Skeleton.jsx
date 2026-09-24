import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  text: 'h-4 rounded',
  title: 'h-6 rounded',
  heading: 'h-8 rounded',
  circle: 'rounded-full aspect-square',
  rect: 'rounded-md',
  button: 'h-10 rounded-md',
  avatar: 'rounded-full aspect-square',
  badge: 'h-5 w-16 rounded-full',
  card: 'rounded-lg',
};

const SIZES = {
  xs: 'h-2',
  sm: 'h-3',
  md: 'h-4',
  lg: 'h-6',
  xl: 'h-8',
  '2xl': 'h-12',
  '3xl': 'h-16',
};

const WIDTHS = {
  full: 'w-full',
  half: 'w-1/2',
  third: 'w-1/3',
  quarter: 'w-1/4',
  threeQuarters: 'w-3/4',
  twoThirds: 'w-2/3',
  auto: '',
};

const Skeleton = forwardRef(function Skeleton(
  {
    variant = 'text',
    width = 'full',
    height,
    size,
    rounded = false,
    animate = true,
    count = 1,
    className = '',
    itemClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const baseVariant = VARIANTS[variant] || VARIANTS.text;
  const widthClass = typeof width === 'string' && WIDTHS[width] ? WIDTHS[width] : '';
  const customWidth = typeof width === 'number' ? `${width}px` : !WIDTHS[width] ? width : undefined;
  const sizeClass = size && SIZES[size] ? SIZES[size] : '';
  const customHeight = height ? `${height}px` : sizeClass || undefined;

  const itemClassNameCombined = [
    'bg-slate-200',
    baseVariant,
    rounded ? 'rounded-full' : '',
    animate ? 'animate-pulse' : '',
    widthClass,
    itemClassName,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (count > 1) {
    return (
      <div
        ref={ref}
        className="flex flex-col gap-2"
        data-testid={testId}
        aria-hidden="true"
        {...rest}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={itemClassNameCombined}
            style={{
              width: customWidth,
              height: customHeight,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={itemClassNameCombined}
      style={{
        width: customWidth,
        height: customHeight,
      }}
      data-testid={testId}
      aria-hidden="true"
      {...rest}
    />
  );
});

Skeleton.propTypes = {
  variant: PropTypes.oneOf([
    'text',
    'title',
    'heading',
    'circle',
    'rect',
    'button',
    'avatar',
    'badge',
    'card',
  ]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']),
  rounded: PropTypes.bool,
  animate: PropTypes.bool,
  count: PropTypes.number,
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default Skeleton;
export { VARIANTS as SKELETON_VARIANTS, WIDTHS as SKELETON_WIDTHS };