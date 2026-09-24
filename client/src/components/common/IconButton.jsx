/**
 * IconButton
 *
 * A dedicated wrapper around Button for the icon-only case. It
 * guarantees a minimum hit area, ensures a screen-reader label exists
 * via `aria-label` or a visually-hidden `srLabel`, and standardizes
 * icon sizing across the platform.
 *
 * @module client/src/components/common/IconButton
 */

import { forwardRef } from 'react';
import clsx from 'clsx';
import Button from './Button.jsx';

const SIZES = {
  xs: { button: 'h-7 w-7 rounded-md', icon: 'h-3.5 w-3.5' },
  sm: { button: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4' },
  md: { button: 'h-9 w-9 rounded-lg', icon: 'h-4 w-4' },
  lg: { button: 'h-11 w-11 rounded-xl', icon: 'h-5 w-5' },
  xl: { button: 'h-12 w-12 rounded-xl', icon: 'h-5 w-5' },
};

const IconButton = forwardRef(function IconButton(
  {
    icon: Icon,
    size = 'md',
    variant = 'ghost',
    srLabel,
    ariaLabel,
    tooltip,
    className = '',
    ...rest
  },
  ref,
) {
  const dimensions = SIZES[size] || SIZES.md;

  return (
    <Button
      ref={ref}
      variant={variant}
      className={clsx(dimensions.button, 'p-0 shrink-0', className)}
      ariaLabel={ariaLabel || srLabel}
      title={tooltip || srLabel}
      iconOnly
      {...rest}
    >
      <Icon className={dimensions.icon} />
      {srLabel ? <span className="sr-only">{srLabel}</span> : null}
    </Button>
  );
});

export default IconButton;