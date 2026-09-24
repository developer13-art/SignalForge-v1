/**
 * Button
 *
 * The canonical button used across the platform. Supports variants,
 * sizes, icon slots, loading state, full width, and — importantly —
 * correct semantics for links, icon-only buttons, and disabled
 * states. Handles keyboard activation, loading spinners, and
 * aria-busy without requiring the caller to remember them.
 *
 * @module client/src/components/common/Button
 */

import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-gradient-primary text-white shadow-glow-primary hover:opacity-95 active:opacity-90 focus-visible:ring-primary-400',
  secondary:
    'bg-surface-elevated text-text-primary border border-surface-border hover:bg-surface-hover focus-visible:ring-primary-400',
  outline:
    'bg-transparent text-text-primary border border-surface-border hover:border-primary-500 hover:text-text-primary focus-visible:ring-primary-400',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-elevated hover:text-text-primary focus-visible:ring-primary-400',
  success:
    'bg-success text-white hover:bg-success/90 active:bg-success/80 focus-visible:ring-success',
  warning:
    'bg-warning text-background hover:bg-warning/90 active:bg-warning/80 focus-visible:ring-warning',
  danger:
    'bg-error text-white hover:bg-error/90 active:bg-error/80 focus-visible:ring-error',
  link:
    'bg-transparent text-primary-400 hover:text-primary-300 underline-offset-4 hover:underline p-0 h-auto focus-visible:ring-primary-400',
};

const SIZES = {
  xs: 'h-7 px-2.5 text-caption gap-1.5 rounded-md',
  sm: 'h-9 px-3.5 text-small gap-2 rounded-lg',
  md: 'h-11 px-5 text-small gap-2 rounded-xl',
  lg: 'h-12 px-6 text-body gap-2.5 rounded-xl',
  xl: 'h-14 px-8 text-h5 gap-3 rounded-2xl',
  icon: 'h-9 w-9 rounded-lg justify-center',
  'icon-sm': 'h-7 w-7 rounded-md justify-center',
  'icon-lg': 'h-11 w-11 rounded-xl justify-center',
};

const Button = forwardRef(function Button(
  {
    as,
    to,
    href,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    iconOnly = false,
    className = '',
    children,
    onClick,
    onKeyDown,
    ariaLabel,
    ariaPressed,
    ariaExpanded,
    ariaControls,
    ariaHaspopup,
    ariaDescribedBy,
    title,
    target,
    rel,
    download,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const variantClasses = VARIANTS[variant] || VARIANTS.primary;
  const sizeClasses = SIZES[iconOnly ? (size === 'md' ? 'icon' : `icon-${size}`) : size] || SIZES.md;

  const classes = clsx(
    'inline-flex select-none items-center justify-center font-medium',
    'transition-all duration-150 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses,
    sizeClasses,
    fullWidth && 'w-full',
    className,
  );

  const content = (
    <>
      {loading ? (
        <Loader2 className={clsx('animate-spin', size === 'xs' || size === 'icon-sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      ) : LeftIcon ? (
        <LeftIcon className={clsx(size === 'xs' || size === 'icon-sm' ? 'h-3.5 w-3.5' : size === 'lg' || size === 'xl' ? 'h-5 w-5' : 'h-4 w-4')} />
      ) : null}

      {children ? <span className={clsx(iconOnly && 'sr-only')}>{children}</span> : null}

      {!loading && RightIcon ? (
        <RightIcon className={clsx(size === 'xs' || size === 'icon-sm' ? 'h-3.5 w-3.5' : size === 'lg' || size === 'xl' ? 'h-5 w-5' : 'h-4 w-4')} />
      ) : null}
    </>
  );

  const sharedProps = {
    className: classes,
    'aria-label': ariaLabel || (iconOnly && typeof children === 'string' ? children : undefined),
    'aria-pressed': ariaPressed,
    'aria-expanded': ariaExpanded,
    'aria-controls': ariaControls,
    'aria-haspopup': ariaHaspopup,
    'aria-describedby': ariaDescribedBy,
    'aria-busy': loading || undefined,
    'aria-disabled': isDisabled || undefined,
    title,
  };

  if (as === 'link' || to) {
    if (isDisabled) {
      return (
        <span {...sharedProps} role="link" aria-disabled="true">
          {content}
        </span>
      );
    }
    return (
      <Link ref={ref} to={to} {...sharedProps} {...rest}>
        {content}
      </Link>
    );
  }

  if (as === 'a' || href) {
    return (
      <a ref={ref} href={isDisabled ? undefined : href} target={target} rel={rel} download={download} {...sharedProps} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...sharedProps}
      {...rest}
    >
      {content}
    </button>
  );
});

export default Button;