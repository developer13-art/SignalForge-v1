import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const VARIANTS = {
  default: {
    base: 'bg-slate-100 text-slate-700 border-slate-200',
    hover: 'hover:bg-slate-200',
    close: 'text-slate-500 hover:text-slate-800 hover:bg-slate-300',
  },
  primary: {
    base: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    hover: 'hover:bg-indigo-100',
    close: 'text-indigo-500 hover:text-indigo-800 hover:bg-indigo-200',
  },
  success: {
    base: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    hover: 'hover:bg-emerald-100',
    close: 'text-emerald-500 hover:text-emerald-800 hover:bg-emerald-200',
  },
  warning: {
    base: 'bg-amber-50 text-amber-700 border-amber-200',
    hover: 'hover:bg-amber-100',
    close: 'text-amber-500 hover:text-amber-800 hover:bg-amber-200',
  },
  danger: {
    base: 'bg-rose-50 text-rose-700 border-rose-200',
    hover: 'hover:bg-rose-100',
    close: 'text-rose-500 hover:text-rose-800 hover:bg-rose-200',
  },
  info: {
    base: 'bg-sky-50 text-sky-700 border-sky-200',
    hover: 'hover:bg-sky-100',
    close: 'text-sky-500 hover:text-sky-800 hover:bg-sky-200',
  },
  neutral: {
    base: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    hover: 'hover:bg-neutral-200',
    close: 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-300',
  },
  dark: {
    base: 'bg-slate-800 text-slate-100 border-slate-700',
    hover: 'hover:bg-slate-700',
    close: 'text-slate-300 hover:text-white hover:bg-slate-600',
  },
};

const SIZES = {
  xs: {
    container: 'h-5 text-[10px] gap-1 px-1.5 rounded',
    icon: 10,
    close: 'h-3 w-3',
  },
  sm: {
    container: 'h-6 text-xs gap-1.5 px-2 rounded',
    icon: 12,
    close: 'h-3.5 w-3.5',
  },
  md: {
    container: 'h-7 text-sm gap-2 px-2.5 rounded-md',
    icon: 14,
    close: 'h-4 w-4',
  },
  lg: {
    container: 'h-9 text-base gap-2 px-3 rounded-md',
    icon: 16,
    close: 'h-4.5 w-4.5',
  },
};

const Tag = forwardRef(function Tag(
  {
    children,
    variant = 'default',
    size = 'sm',
    icon: Icon,
    onClose,
    onClick,
    disabled = false,
    interactive = false,
    className = '',
    title,
    ariaLabel,
    testId,
    ...rest
  },
  ref,
) {
  const styles = VARIANTS[variant] || VARIANTS.default;
  const sizeStyles = SIZES[size] || SIZES.sm;

  const isInteractive = interactive || Boolean(onClick);
  const isDisabled = disabled;

  const containerClassName = useMemo(() => {
    const base = [
      'inline-flex items-center justify-center font-medium border select-none transition-colors duration-150',
      sizeStyles.container,
      styles.base,
      isDisabled ? 'opacity-50 cursor-not-allowed' : '',
      isInteractive && !isDisabled ? `${styles.hover} cursor-pointer` : '',
      !isInteractive && !isDisabled ? '' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return base;
  }, [sizeStyles.container, styles, isDisabled, isInteractive, className]);

  const handleClick = (event) => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (onClick) {
      onClick(event);
    }
  };

  const handleClose = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isDisabled) {
      return;
    }
    if (onClose) {
      onClose(event);
    }
  };

  const handleKeyDown = (event) => {
    if (isDisabled) {
      return;
    }
    if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      if (onClick) {
        onClick(event);
      }
    }
  };

  const Element = isInteractive ? 'button' : 'span';

  return (
    <Element
      ref={ref}
      type={isInteractive ? 'button' : undefined}
      className={containerClassName}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      disabled={isInteractive ? isDisabled : undefined}
      title={title}
      aria-label={ariaLabel}
      data-testid={testId}
      {...rest}
    >
      {Icon ? (
        <Icon
          size={sizeStyles.icon}
          className="shrink-0"
          aria-hidden="true"
          focusable="false"
        />
      ) : null}

      <span className="truncate leading-none">{children}</span>

      {onClose ? (
        <button
          type="button"
          onClick={handleClose}
          disabled={isDisabled}
          aria-label={typeof children === 'string' ? `Remove ${children}` : 'Remove'}
          className={[
            'inline-flex items-center justify-center rounded-full transition-colors duration-150',
            sizeStyles.close,
            styles.close,
            isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <X size={sizeStyles.icon - 2} aria-hidden="true" focusable="false" />
        </button>
      ) : null}
    </Element>
  );
});

Tag.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'warning',
    'danger',
    'info',
    'neutral',
    'dark',
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  onClose: PropTypes.func,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  interactive: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  testId: PropTypes.string,
};

export default Tag;
export { VARIANTS as TAG_VARIANTS, SIZES as TAG_SIZES };