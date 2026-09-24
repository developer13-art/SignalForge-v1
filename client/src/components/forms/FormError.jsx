import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle } from 'lucide-react';

const SIZES = {
  sm: { text: 'text-xs', icon: 12, gap: 'gap-1' },
  md: { text: 'text-sm', icon: 14, gap: 'gap-1.5' },
  lg: { text: 'text-base', icon: 16, gap: 'gap-2' },
};

const FormError = forwardRef(function FormError(
  {
    error,
    size = 'sm',
    icon: Icon = AlertCircle,
    showIcon = true,
    role = 'alert',
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  if (!error) {
    return null;
  }

  const message =
    typeof error === 'string'
      ? error
      : error && typeof error === 'object'
      ? error.message || error.error || null
      : null;

  if (!message) {
    return null;
  }

  const sizeConfig = SIZES[size] || SIZES.sm;

  return (
    <p
      ref={ref}
      role={role}
      className={[
        'flex items-start font-medium text-rose-600',
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
        <Icon
          size={sizeConfig.icon}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
      ) : null}
      <span>{message}</span>
    </p>
  );
});

FormError.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  showIcon: PropTypes.bool,
  role: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default FormError;