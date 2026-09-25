import React from 'react';
import PropTypes from 'prop-types';
import { Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import ProgressBar from '../../components/common/ProgressBar';

const STATUS_CONFIG = {
  healthy: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    label: 'Healthy',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Needs Attention',
  },
  critical: {
    icon: XCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    label: 'At Risk',
  },
};

const AccountHealthWidget = function AccountHealthWidget({ health }) {
  if (!health) {
    return (
      <Card padding="lg">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Activity size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              Account Health
            </Heading>
            <Text color="muted" className="text-xs">
              No health data available
            </Text>
          </div>
        </div>
      </Card>
    );
  }

  const config = STATUS_CONFIG[health.status] || STATUS_CONFIG.healthy;
  const Icon = config.icon;

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={[
              'flex h-10 w-10 items-center justify-center rounded-lg',
              config.bg,
              config.color,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Icon size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              Account Health
            </Heading>
            <Text color="muted" className="text-xs">
              {config.label}
            </Text>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">{health.score || 0}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Health Score
          </p>
        </div>
      </div>

      <div className="mt-4">
        <ProgressBar
          value={health.score || 0}
          max={100}
          size="md"
          variant={
            health.status === 'critical'
              ? 'danger'
              : health.status === 'warning'
              ? 'warning'
              : 'success'
          }
        />
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
        {health.factors && health.factors.length > 0 ? (
          health.factors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-600">{factor.label}</span>
              <span
                className={[
                  'text-xs font-semibold',
                  factor.status === 'good'
                    ? 'text-emerald-600'
                    : factor.status === 'warning'
                    ? 'text-amber-600'
                    : 'text-rose-600',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {factor.value}
              </span>
            </div>
          ))
        ) : null}
      </div>
    </Card>
  );
};

AccountHealthWidget.propTypes = {
  health: PropTypes.shape({
    status: PropTypes.oneOf(['healthy', 'warning', 'critical']),
    score: PropTypes.number,
    factors: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status: PropTypes.oneOf(['good', 'warning', 'critical']),
      }),
    ),
  }),
};

export default AccountHealthWidget;