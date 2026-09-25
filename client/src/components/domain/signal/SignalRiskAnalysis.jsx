import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ShieldAlert, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import ProgressBar from '../../common/ProgressBar';

const SignalRiskAnalysis = forwardRef(function SignalRiskAnalysis(
  {
    riskScore,
    riskLevel,
    checks = [],
    warnings = [],
    notes,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const resolvedLevel = riskLevel || (riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low');

  const levelConfig = {
    low: { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Low Risk' },
    medium: { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Medium Risk' },
    high: { icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50', label: 'High Risk' },
  };

  const config = levelConfig[resolvedLevel] || levelConfig.low;
  const Icon = config.icon;

  const progressVariant =
    resolvedLevel === 'high' ? 'danger' : resolvedLevel === 'medium' ? 'warning' : 'success';

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Risk Analysis
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Automated risk check results for this signal
          </p>
        </div>

        <div className={['flex items-center gap-2 rounded-lg px-3 py-2', config.bg].filter(Boolean).join(' ')}>
          <Icon size={16} className={config.color} aria-hidden="true" />
          <span className={['text-sm font-semibold', config.color].filter(Boolean).join(' ')}>
            {config.label}
          </span>
        </div>
      </div>

      {riskScore !== undefined ? (
        <>
          <Separator spacing="md" />
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Risk Score</span>
              <span className="font-semibold text-slate-900">{riskScore}/100</span>
            </div>
            <ProgressBar value={riskScore} max={100} size="sm" variant={progressVariant} className="mt-2" />
          </div>
        </>
      ) : null}

      {checks.length > 0 ? (
        <>
          <Separator spacing="md" />
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Validation Checks
          </h4>
          <ul className="mt-3 space-y-2">
            {checks.map((check, index) => {
              const CheckIcon =
                check.status === 'pass' ? CheckCircle2 : check.status === 'warn' ? AlertTriangle : XCircle;
              const color =
                check.status === 'pass'
                  ? 'text-emerald-600'
                  : check.status === 'warn'
                  ? 'text-amber-600'
                  : 'text-rose-600';

              return (
                <li key={check.key || index} className="flex items-start gap-2.5">
                  <CheckIcon size={14} className={['mt-0.5 shrink-0', color].filter(Boolean).join(' ')} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{check.label}</p>
                    {check.description ? (
                      <p className="mt-0.5 text-xs text-slate-500">{check.description}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {warnings.length > 0 ? (
        <>
          <Separator spacing="md" />
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
              <AlertTriangle size={12} aria-hidden="true" />
              Warnings
            </p>
            <ul className="mt-2 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-xs text-amber-800">
                  · {warning}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {notes ? (
        <>
          <Separator spacing="md" />
          <p className="text-xs text-slate-500">
            <strong className="font-semibold text-slate-700">Notes: </strong>
            {notes}
          </p>
        </>
      ) : null}
    </Card>
  );
});

SignalRiskAnalysis.propTypes = {
  riskScore: PropTypes.number,
  riskLevel: PropTypes.oneOf(['low', 'medium', 'high']),
  checks: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.node,
      description: PropTypes.node,
      status: PropTypes.oneOf(['pass', 'warn', 'fail']),
    })
  ),
  warnings: PropTypes.arrayOf(PropTypes.string),
  notes: PropTypes.node,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SignalRiskAnalysis;