import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Shield, AlertTriangle, Activity } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import ProgressBar from '../../common/ProgressBar';

const RiskAnalysisWidget = forwardRef(function RiskAnalysisWidget(
  {
    riskScore = 0,
    riskLevel,
    metrics = [],
    flags = [],
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const resolvedLevel =
    riskLevel || (riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low');

  const levelConfig = {
    low: { label: 'Low Risk', color: 'text-emerald-600', bg: 'bg-emerald-50', variant: 'success' },
    medium: { label: 'Medium Risk', color: 'text-amber-600', bg: 'bg-amber-50', variant: 'warning' },
    high: { label: 'High Risk', color: 'text-rose-600', bg: 'bg-rose-50', variant: 'danger' },
  };

  const config = levelConfig[resolvedLevel] || levelConfig.low;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={[
              'flex h-9 w-9 items-center justify-center rounded-full',
              config.bg,
              config.color,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Shield size={16} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Risk Analysis
            </h3>
            <p className="text-[11px] text-slate-400">Composite risk metrics</p>
          </div>
        </div>

        <span className={['text-sm font-semibold', config.color].filter(Boolean).join(' ')}>
          {config.label}
        </span>
      </div>

      <Separator spacing="md" />

      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">Risk Score</span>
          <span className="font-semibold text-slate-900">{riskScore}/100</span>
        </div>
        <ProgressBar
          value={riskScore}
          max={100}
          size="sm"
          variant={config.variant}
          className="mt-2"
        />
      </div>

      {metrics.length > 0 ? (
        <>
          <Separator spacing="md" />
          <ul className="space-y-3">
            {metrics.map((metric) => (
              <li key={metric.key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{metric.label}</span>
                  <span className="font-semibold text-slate-900">{metric.value}</span>
                </div>
                {metric.score !== undefined ? (
                  <ProgressBar
                    value={metric.score}
                    max={100}
                    size="xs"
                    variant={
                      metric.score >= 70
                        ? 'danger'
                        : metric.score >= 40
                        ? 'warning'
                        : 'success'
                    }
                    className="mt-1.5"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {flags.length > 0 ? (
        <>
          <Separator spacing="md" />
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
              <AlertTriangle size={12} aria-hidden="true" />
              Risk Flags
            </p>
            <ul className="mt-2 space-y-1">
              {flags.map((flag, index) => (
                <li key={index} className="text-xs text-amber-800">
                  · {flag}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {loading ? (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Activity size={12} className="animate-pulse" aria-hidden="true" />
          Analyzing...
        </p>
      ) : null}
    </Card>
  );
});

RiskAnalysisWidget.propTypes = {
  riskScore: PropTypes.number,
  riskLevel: PropTypes.oneOf(['low', 'medium', 'high']),
  metrics: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.node,
      value: PropTypes.node,
      score: PropTypes.number,
    })
  ),
  flags: PropTypes.arrayOf(PropTypes.string),
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RiskAnalysisWidget;