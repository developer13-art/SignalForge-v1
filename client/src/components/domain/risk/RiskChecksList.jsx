import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';

const STATUS_CONFIG = {
  pass: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  warn: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  fail: { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
};

const RiskChecksList = forwardRef(function RiskChecksList(
  {
    checks = [],
    overallResult,
    title = 'Risk Checks',
    description = 'Pre-execution validation of the signal against your risk profile',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const passed = checks.filter((c) => c.status === 'pass').length;
  const total = checks.length;

  const isApproved = overallResult === 'approved' || passed === total;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={[
              'flex h-10 w-10 items-center justify-center rounded-lg',
              isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isApproved ? <ShieldCheck size={18} aria-hidden="true" /> : <ShieldAlert size={18} aria-hidden="true" />}
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>

        <div className="text-right">
          <p
            className={[
              'text-sm font-bold',
              isApproved ? 'text-emerald-600' : 'text-rose-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {passed}/{total}
          </p>
          <p className="text-[11px] text-slate-500">checks passed</p>
        </div>
      </div>

      <Separator spacing="md" />

      <ul className="space-y-2">
        {checks.map((check) => {
          const config = STATUS_CONFIG[check.status] || STATUS_CONFIG.warn;
          const Icon = config.icon;

          return (
            <li
              key={check.key || check.label}
              className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3"
            >
              <span
                className={[
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  config.bg,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Icon size={14} className={config.color} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{check.label}</p>
                {check.description ? (
                  <p className="mt-0.5 text-xs text-slate-500">{check.description}</p>
                ) : null}
                {check.value !== undefined ? (
                  <p className="mt-1 text-xs font-medium text-slate-700">
                    {check.value}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
});

RiskChecksList.propTypes = {
  checks: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.node,
      description: PropTypes.node,
      value: PropTypes.node,
      status: PropTypes.oneOf(['pass', 'warn', 'fail']),
    })
  ),
  overallResult: PropTypes.oneOf(['approved', 'rejected', 'pending']),
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RiskChecksList;