import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle } from 'lucide-react';

const SIZES = {
  sm: { text: 'text-xs', icon: 12, gap: 'gap-1' },
  md: { text: 'text-sm', icon: 14, gap: 'gap-1.5' },
  lg: { text: 'text-base', icon: 16, gap: 'gap-2' },
};

const InlineError = forwardRef(function InlineError(
  {
    message,
    error,
    size = 'sm',
    icon: Icon = AlertCircle,
    showIcon = true,
    muted = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const resolvedMessage =
    message ||
    (typeof error === 'string'
      ? error
      : error && typeof error === 'object'
      ? error.message || error.error || null
      : null);

  if (!resolvedMessage) {
    return null;
  }

  const sizeConfig = SIZES[size] || SIZES.sm;

  return (
    <p
      ref={ref}
      role="alert"
      className={[
        'inline-flex items-start font-medium',
        muted ? 'text-slate-500' : 'text-rose-600',
        sizeConfig.text,
        sizeConfig.gap,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon ? (
        <Icon size={sizeConfig.icon} className="mt-0.5 shrink-0" aria-hidden="true" />
      ) : null}
      <span>{resolvedMessage}</span>
    </p>
  );
});

InlineError.propTypes = {
  message: PropTypes.node,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  showIcon: PropTypes.bool,
  muted: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default InlineError;