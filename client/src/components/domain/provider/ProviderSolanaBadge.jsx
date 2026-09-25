import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { BadgeCheck, ExternalLink } from 'lucide-react';

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 10 },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 12 },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 14 },
  lg: { container: 'gap-2 px-3 py-1.5 text-base', icon: 16 },
};

const ProviderSolanaBadge = forwardRef(function ProviderSolanaBadge(
  {
    label = 'Solana Verified',
    size = 'sm',
    showIcon = true,
    showLabel = true,
    showLink = false,
    href,
    bordered = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const sizeConfig = SIZES[size] || SIZES.sm;

  const content = (
    <>
      {showIcon ? <BadgeCheck size={sizeConfig.icon} aria-hidden="true" /> : null}
      {showLabel ? label : null}
      {showLink ? <ExternalLink size={sizeConfig.icon - 2} aria-hidden="true" /> : null}
    </>
  );

  const sharedClass = [
    'inline-flex items-center font-semibold rounded-full',
    bordered ? 'border' : '',
    'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border-violet-200',
    sizeConfig.container,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClass}
        data-testid={testId}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <span ref={ref} className={sharedClass} data-testid={testId} {...rest}>
      {content}
    </span>
  );
});

ProviderSolanaBadge.propTypes = {
  label: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showLabel: PropTypes.bool,
  showLink: PropTypes.bool,
  href: PropTypes.string,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ProviderSolanaBadge;