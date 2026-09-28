import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Plus, Share2, ExternalLink, Copy } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500',
};

const ICONS = {
  create: Plus,
  share: Share2,
  open: ExternalLink,
  copy: Copy,
};

const BlinkActionButton = forwardRef(function BlinkActionButton(
  {
    action = 'create',
    label,
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    disabled = false,
    className = '',
    onClick,
    testId,
    ...rest
  },
  ref,
) {
  const IconComponent = icon || ICONS[action] || Plus;
  const variantClass = VARIANTS[variant] || VARIANTS.primary;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const resolvedLabel =
    label ||
    {
      create: 'Create Blink',
      share: 'Share Blink',
      open: 'Open Blink',
      copy: 'Copy Blink URL',
    }[action] ||
    'Continue';

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size] || sizeClasses.md,
        variantClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <IconComponent size={16} aria-hidden="true" />
      )}
      <span>{resolvedLabel}</span>
    </button>
  );
});

BlinkActionButton.propTypes = {
  action: PropTypes.oneOf(['create', 'share', 'open', 'copy']),
  label: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  testId: PropTypes.string,
};

export default BlinkActionButton;
export { VARIANTS as BLINK_ACTION_BUTTON_VARIANTS };