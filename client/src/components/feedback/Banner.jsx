import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { X, ArrowRight, Megaphone } from 'lucide-react';

const VARIANTS = {
  info: 'bg-sky-600 text-white',
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-500 text-white',
  danger: 'bg-rose-600 text-white',
  primary: 'bg-indigo-600 text-white',
  dark: 'bg-slate-900 text-white',
  light: 'bg-slate-100 text-slate-900 border-b border-slate-200',
};

const POSITIONS = {
  static: '',
  fixedTop: 'fixed top-0 left-0 right-0 z-40',
  fixedBottom: 'fixed bottom-0 left-0 right-0 z-40',
  stickyTop: 'sticky top-0 z-30',
};

const Banner = forwardRef(function Banner(
  {
    variant = 'primary',
    position = 'static',
    icon: Icon = Megaphone,
    showIcon = true,
    message,
    description,
    ctaLabel,
    ctaHref,
    onCtaClick,
    secondaryCtaLabel,
    onSecondaryCtaClick,
    closable = false,
    onClose,
    sticky = false,
    fullWidth = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const positionClass = POSITIONS[sticky && position === 'static' ? 'stickyTop' : position] || '';

  const handleClose = () => {
    setDismissed(true);
    if (onClose) {
      onClose();
    }
  };

  const CtaWrapper = ctaHref ? 'a' : 'button';

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Announcement banner"
      className={[
        'flex items-center gap-3 px-4 py-2.5 shadow-sm',
        variantClass,
        positionClass,
        fullWidth ? 'w-full' : 'rounded-lg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon && Icon ? (
        <Icon size={18} className="shrink-0" aria-hidden="true" />
      ) : null}

      <div className="min-w-0 flex-1">
        {message ? (
          <p className="text-sm font-semibold leading-tight">{message}</p>
        ) : null}
        {description ? (
          <p className="mt-0.5 text-xs opacity-90 leading-snug">{description}</p>
        ) : null}
      </div>

      {ctaLabel ? (
        <CtaWrapper
          href={ctaHref}
          type={ctaHref ? undefined : 'button'}
          onClick={onCtaClick}
          className="shrink-0 inline-flex items-center gap-1 rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {ctaLabel}
          <ArrowRight size={12} aria-hidden="true" />
        </CtaWrapper>
      ) : null}

      {secondaryCtaLabel ? (
        <button
          type="button"
          onClick={onSecondaryCtaClick}
          className="shrink-0 text-xs font-medium underline-offset-2 hover:underline"
        >
          {secondaryCtaLabel}
        </button>
      ) : null}

      {closable ? (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close banner"
          className="shrink-0 rounded-md p-1 opacity-80 transition-opacity hover:bg-white/15 hover:opacity-100"
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});

Banner.propTypes = {
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger', 'primary', 'dark', 'light']),
  position: PropTypes.oneOf(['static', 'fixedTop', 'fixedBottom', 'stickyTop']),
  icon: PropTypes.elementType,
  showIcon: PropTypes.bool,
  message: PropTypes.node,
  description: PropTypes.node,
  ctaLabel: PropTypes.string,
  ctaHref: PropTypes.string,
  onCtaClick: PropTypes.func,
  secondaryCtaLabel: PropTypes.string,
  onSecondaryCtaClick: PropTypes.func,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
  sticky: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default Banner;
export { VARIANTS as BANNER_VARIANTS };