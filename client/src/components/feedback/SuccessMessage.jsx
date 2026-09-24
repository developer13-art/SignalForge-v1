import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2 } from 'lucide-react';

const SIZES = {
  sm: { text: 'text-xs', icon: 14, gap: 'gap-1.5' },
  md: { text: 'text-sm', icon: 16, gap: 'gap-2' },
  lg: { text: 'text-base', icon: 18, gap: 'gap-2' },
};

const SuccessMessage = forwardRef(function SuccessMessage(
  {
    message,
    title,
    description,
    size = 'md',
    icon: Icon = CheckCircle2,
    showIcon = true,
    variant = 'plain',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const sizeConfig = SIZES[size] || SIZES.md;

  const variantClass =
    variant === 'filled'
      ? 'rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2'
      : variant === 'badge'
      ? 'rounded-full bg-emerald-100 px-3 py-1'
      : '';

  const content = (
    <>
      {showIcon ? (
        <Icon
          size={sizeConfig.icon}
          className="mt-0.5 shrink-0 text-emerald-600"
          aria-hidden="true"
        />
      ) : null}

      <span className="flex-1">
        {title ? (
          <span className="block font-semibold text-emerald-800">{title}</span>
        ) : null}

        {description ? (
          <span className="mt-0.5 block text-emerald-700">{description}</span>
        ) : null}

        {!title && !description && message ? <span>{message}</span> : null}
      </span>
    </>
  );

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={[
        'inline-flex items-start font-medium text-emerald-700',
        sizeConfig.text,
        sizeConfig.gap,
        variantClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {content}
    </div>
  );
});

SuccessMessage.propTypes = {
  message: PropTypes.node,
  title: PropTypes.node,
  description: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  showIcon: PropTypes.bool,
  variant: PropTypes.oneOf(['plain', 'filled', 'badge']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SuccessMessage;