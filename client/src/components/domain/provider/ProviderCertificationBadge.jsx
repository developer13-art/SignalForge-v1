import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Award, ShieldCheck, BadgeCheck, Star, Crown, Medal } from 'lucide-react';

const LEVELS = {
  bronze: { label: 'Bronze', icon: Medal, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  silver: { label: 'Silver', icon: Medal, color: 'text-slate-700', bg: 'bg-slate-100 border-slate-300' },
  gold: { label: 'Gold', icon: Award, color: 'text-amber-800', bg: 'bg-amber-100 border-amber-300' },
  platinum: { label: 'Platinum', icon: Crown, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  verified: { label: 'Verified', icon: ShieldCheck, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  certified: { label: 'Certified', icon: BadgeCheck, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  elite: { label: 'Elite', icon: Star, color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
};

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 10 },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 12 },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 14 },
  lg: { container: 'gap-2 px-3 py-1.5 text-base', icon: 16 },
};

const ProviderCertificationBadge = forwardRef(function ProviderCertificationBadge(
  {
    level = 'verified',
    size = 'sm',
    showIcon = true,
    showLabel = true,
    bordered = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const config = LEVELS[level] || LEVELS.verified;
  const sizeConfig = SIZES[size] || SIZES.sm;
  const Icon = config.icon;

  return (
    <span
      ref={ref}
      role="status"
      aria-label={`Certification: ${config.label}`}
      className={[
        'inline-flex items-center font-semibold rounded-full',
        bordered ? 'border' : '',
        config.bg,
        config.color,
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon ? <Icon size={sizeConfig.icon} aria-hidden="true" /> : null}
      {showLabel ? config.label : null}
    </span>
  );
});

ProviderCertificationBadge.propTypes = {
  level: PropTypes.oneOf(['bronze', 'silver', 'gold', 'platinum', 'verified', 'certified', 'elite']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showLabel: PropTypes.bool,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ProviderCertificationBadge;
export { LEVELS as PROVIDER_CERTIFICATION_LEVELS };