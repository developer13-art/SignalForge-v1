import React from 'react';
import PropTypes from 'prop-types';
import { Shield, ShieldAlert, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';

const RiskOverviewWidget = function RiskOverviewWidget({ risk, onConfigure }) {
  if (!risk) {
    return (
      <Card padding="lg">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Shield size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              Risk Overview
            </Heading>
            <Text color="muted" className="text-xs">
              No risk profile configured
            </Text>
          </div>
        </div>
      </Card>
    );
  }

  const dailyLossUsed = risk.dailyLossUsed || 0;
  const dailyLossMax = risk.dailyLossMax || 1;
  const dailyLossPercent = Math.min(100, (dailyLossUsed / dailyLossMax) * 100);

  const drawdownUsed = risk.drawdownUsed || 0;
  const drawdownMax = risk.drawdownMax || 1;
  const drawdownPercent = Math.min(100, (drawdownUsed / drawdownMax) * 100);

  const hasWarning = dailyLossPercent > 70 || drawdownPercent > 70;

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={[
              'flex h-10 w-10 items-center justify-center rounded-lg',
              hasWarning ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {hasWarning ? (
              <ShieldAlert size={18} aria-hidden="true" />
            ) : (
              <Shield size={18} aria-hidden="true" />
            )}
          </span>
          <div>
            <Heading level={3} size="text-base">
              Risk Overview
            </Heading>
            <Text color="muted" className="text-xs">
              {hasWarning ? 'Approaching limits' : 'Within limits'}
            </Text>
          </div>
        </div>

        {onConfigure ? (
          <Button variant="ghost" size="sm" onClick={onConfigure} trailingIcon={ArrowRight}>
            Configure
          </Button>
        ) : null}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Daily Loss</span>
            <span className="font-semibold text-slate-900">
              {dailyLossUsed} / {dailyLossMax}
            </span>
          </div>
          <ProgressBar
            value={dailyLossPercent}
            max={100}
            size="sm"
            variant={dailyLossPercent > 70 ? 'danger' : dailyLossPercent > 40 ? 'warning' : 'success'}
            className="mt-1.5"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Max Drawdown</span>
            <span className="font-semibold text-slate-900">
              {drawdownUsed}% / {drawdownMax}%
            </span>
          </div>
          <ProgressBar
            value={drawdownPercent}
            max={100}
            size="sm"
            variant={drawdownPercent > 70 ? 'danger' : drawdownPercent > 40 ? 'warning' : 'success'}
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Open Trades
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {risk.openTrades || 0} / {risk.maxOpenTrades || '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Emergency Stop
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {risk.emergencyStop ? 'Active' : 'Ready'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

RiskOverviewWidget.propTypes = {
  risk: PropTypes.shape({
    dailyLossUsed: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dailyLossMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    drawdownUsed: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    drawdownMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    openTrades: PropTypes.number,
    maxOpenTrades: PropTypes.number,
    emergencyStop: PropTypes.bool,
  }),
  onConfigure: PropTypes.func,
};

export default RiskOverviewWidget;