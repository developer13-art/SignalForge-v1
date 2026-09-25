import React from 'react';
import PropTypes from 'prop-types';
import { Activity, Zap, Shield, AlertTriangle, Settings2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const LiveTradingStatus = function LiveTradingStatus({ status, onConfigure }) {
  const isActive = status?.active;
  const hasWarnings = status?.warnings && status.warnings.length > 0;

  return (
    <Card padding="lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={[
              'flex h-10 w-10 items-center justify-center rounded-lg',
              isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Activity size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              Live Trading Status
            </Heading>
            <Text color="muted" className="text-xs">
              {isActive ? 'Automation is running' : 'Automation is paused'}
            </Text>
          </div>
        </div>

        <Badge variant={isActive ? 'success' : 'neutral'} size="sm">
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            <Zap size={10} aria-hidden="true" />
            Signals Today
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">{status?.signalsToday || 0}</p>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            <Shield size={10} aria-hidden="true" />
            Trades Executed
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">{status?.tradesExecuted || 0}</p>
        </div>
      </div>

      {hasWarnings ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
            <AlertTriangle size={12} aria-hidden="true" />
            Warnings
          </p>
          <ul className="mt-1.5 space-y-1">
            {status.warnings.slice(0, 3).map((warning, index) => (
              <li key={index} className="text-xs text-amber-800">
                · {warning}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {status?.lastSignalAt ? (
        <p className="mt-4 text-[11px] text-slate-400">
          Last signal: {status.lastSignalAt}
        </p>
      ) : null}

      {onConfigure ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onConfigure}
            leadingIcon={Settings2}
          >
            Configure Trading
          </Button>
        </div>
      ) : null}
    </Card>
  );
};

LiveTradingStatus.propTypes = {
  status: PropTypes.shape({
    active: PropTypes.bool,
    signalsToday: PropTypes.number,
    tradesExecuted: PropTypes.number,
    warnings: PropTypes.arrayOf(PropTypes.string),
    lastSignalAt: PropTypes.string,
  }),
  onConfigure: PropTypes.func,
};

export default LiveTradingStatus;