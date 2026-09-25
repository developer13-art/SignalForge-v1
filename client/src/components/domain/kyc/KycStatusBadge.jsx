import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Ban,
  FileText,
  Loader2,
} from 'lucide-react';

const STATUS_MAP = {
  not_started: { label: 'Not Started', variant: 'neutral', icon: FileText },
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  under_review: { label: 'Under Review', variant: 'info', icon: Loader2, spin: true },
  verified: { label: 'Verified', variant: 'success', icon: CheckCircle2 },
  approved: { label: 'Approved', variant: 'success', icon: CheckCircle2 },
  rejected: { label: 'Rejected', variant: 'danger', icon: XCircle },
  resubmission: { label: 'Resubmission Required', variant: 'warning', icon: AlertCircle },
  expired: { label: 'Expired', variant: 'neutral', icon: Clock },
  suspended: { label: 'Suspended', variant: 'danger', icon: Ban },
  kyc_required: { label: 'KYC Required', variant: 'warning', icon: ShieldCheck },
};

const VARIANTS = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 10 },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 12 },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 14 },
  lg: { container: 'gap-2 px-3 py-1.5 text-base', icon: 16 },
};

const KycStatusBadge = forwardRef(function KycStatusBadge(
  {
    status = 'not_started',
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
  const key = String(status).toLowerCase().replace(/\s+/g, '_');
  const config = STATUS_MAP[key] || STATUS_MAP.not_started;
  const sizeConfig = SIZES[size] || SIZES.sm;
  const variantClass = VARIANTS[config.variant] || VARIANTS.neutral;
  const Icon = config.icon;

  return (
    <span
      ref={ref}
      role="status"
      aria-label={`KYC status: ${config.label}`}
      className={[
        'inline-flex items-center font-semibold rounded-full',
        bordered ? 'border' : '',
        variantClass,
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon ? (
        <Icon size={sizeConfig.icon} className={config.spin ? 'animate-spin' : ''} aria-hidden="true" />
      ) : null}
      {showLabel ? config.label : null}
    </span>
  );
});

KycStatusBadge.propTypes = {
  status: PropTypes.oneOf([
    'not_started',
    'pending',
    'under_review',
    'verified',
    'approved',
    'rejected',
    'resubmission',
    'expired',
    'suspended',
    'kyc_required',
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showLabel: PropTypes.bool,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default KycStatusBadge;
export { STATUS_MAP as KYC_STATUS_MAP };