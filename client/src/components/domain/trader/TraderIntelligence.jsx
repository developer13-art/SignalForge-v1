import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Brain, AlertTriangle, TrendingUp, Shield, Activity } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import ProgressBar from '../../common/ProgressBar';

const TraderIntelligence = forwardRef(function TraderIntelligence(
  {
    intelligence,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!intelligence) {
    return null;
  }

  const {
    consistency,
    discipline,
    riskBehavior,
    martingaleDetection,
    gridDetection,
    newsExposure,
    recoveryTrading,
    holdingTime,
    styleClassification,
  } = intelligence;

  const scores = [
    {
      key: 'consistency',
      label: 'Consistency',
      value: consistency,
      variant: 'success',
    },
    {
      key: 'discipline',
      label: 'Discipline',
      value: discipline,
      variant: 'primary',
    },
    {
      key: 'riskBehavior',
      label: 'Risk Behavior',
      value: riskBehavior,
      variant: 'warning',
    },
  ].filter((item) => item.value !== undefined);

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
          <Brain size={16} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Trader Intelligence
          </h3>
          <p className="text-[11px] text-slate-400">AI-computed behavioral metrics</p>
        </div>
      </div>

      {scores.length > 0 ? (
        <>
          <Separator spacing="md" />
          <div className="space-y-4">
            {scores.map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.value}%</span>
                </div>
                <ProgressBar
                  value={item.value}
                  max={100}
                  variant={item.variant}
                  size="sm"
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>
        </>
      ) : null}

      <Separator spacing="md" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {styleClassification ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Style Classification
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{styleClassification}</p>
          </div>
        ) : null}

        {holdingTime ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Average Holding Time
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{holdingTime}</p>
          </div>
        ) : null}
      </div>

      {martingaleDetection || gridDetection || newsExposure || recoveryTrading ? (
        <>
          <Separator spacing="md" />
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Shield size={12} aria-hidden="true" />
            Behavior Flags
          </h4>
          <ul className="mt-3 space-y-2">
            {martingaleDetection ? (
              <li className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-amber-900">Martingale Detected</p>
                  <p className="mt-0.5 text-[11px] text-amber-800">{martingaleDetection}</p>
                </div>
              </li>
            ) : null}

            {gridDetection ? (
              <li className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-amber-900">Grid Trading Detected</p>
                  <p className="mt-0.5 text-[11px] text-amber-800">{gridDetection}</p>
                </div>
              </li>
            ) : null}

            {newsExposure ? (
              <li className="flex items-start gap-2 rounded-md border border-sky-200 bg-sky-50 p-2.5">
                <Activity size={14} className="mt-0.5 shrink-0 text-sky-600" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-sky-900">News Exposure</p>
                  <p className="mt-0.5 text-[11px] text-sky-800">{newsExposure}</p>
                </div>
              </li>
            ) : null}

            {recoveryTrading ? (
              <li className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-2.5">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-rose-900">Recovery Trading</p>
                  <p className="mt-0.5 text-[11px] text-rose-800">{recoveryTrading}</p>
                </div>
              </li>
            ) : null}
          </ul>
        </>
      ) : null}

      {intelligence.summary ? (
        <>
          <Separator spacing="md" />
          <p className="text-xs leading-relaxed text-slate-600">{intelligence.summary}</p>
        </>
      ) : null}
    </Card>
  );
});

TraderIntelligence.propTypes = {
  intelligence: PropTypes.shape({
    consistency: PropTypes.number,
    discipline: PropTypes.number,
    riskBehavior: PropTypes.number,
    martingaleDetection: PropTypes.string,
    gridDetection: PropTypes.string,
    newsExposure: PropTypes.string,
    recoveryTrading: PropTypes.string,
    holdingTime: PropTypes.string,
    styleClassification: PropTypes.string,
    summary: PropTypes.string,
  }),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TraderIntelligence;