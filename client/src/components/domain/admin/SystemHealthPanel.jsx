import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Activity, CheckCircle2, AlertTriangle, XCircle, Database, Server, Zap, Cloud } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import ProgressBar from '../../common/ProgressBar';

const STATUS_CONFIG = {
  healthy: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  degraded: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  down: { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
};

const COMPONENT_ICONS = {
  database: Database,
  api: Server,
  queue: Zap,
  websocket: Cloud,
  solana: Cloud,
  telegram: Cloud,
  metaapi: Server,
};

const SystemHealthPanel = forwardRef(function SystemHealthPanel(
  {
    components = [],
    overallStatus = 'healthy',
    uptime,
    lastIncident,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const overallConfig = STATUS_CONFIG[overallStatus] || STATUS_CONFIG.healthy;
  const OverallIcon = overallConfig.icon;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={[
              'flex h-11 w-11 items-center justify-center rounded-lg',
              overallConfig.bg,
              overallConfig.color,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <OverallIcon size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              System Health
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 capitalize">
              Overall status: {overallStatus}
            </p>
          </div>
        </div>

        {uptime ? (
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Uptime
            </p>
            <p className="mt-1 text-base font-bold text-slate-900">{uptime}</p>
          </div>
        ) : null}
      </div>

      <Separator spacing="md" />

      <ul className="space-y-3">
        {components.map((component) => {
          const config = STATUS_CONFIG[component.status] || STATUS_CONFIG.healthy;
          const Icon = COMPONENT_ICONS[component.key] || Activity;
          const StatusIcon = config.icon;

          return (
            <li
              key={component.key}
              className="rounded-md border border-slate-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    <Icon size={14} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{component.label}</p>
                    {component.description ? (
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {component.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <span
                  className={[
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                    config.bg,
                    config.color,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <StatusIcon size={10} aria-hidden="true" />
                  {component.status}
                </span>
              </div>

              {component.metric !== undefined ? (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{component.metricLabel || 'Metric'}</span>
                    <span className="font-semibold text-slate-700">{component.metric}</span>
                  </div>
                  {component.metricPercent !== undefined ? (
                    <ProgressBar
                      value={component.metricPercent}
                      max={100}
                      size="xs"
                      variant={
                        component.metricPercent > 90
                          ? 'danger'
                          : component.metricPercent > 75
                          ? 'warning'
                          : 'success'
                      }
                      className="mt-1"
                    />
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {lastIncident ? (
        <>
          <Separator spacing="md" />
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-900">Last Incident</p>
            <p className="mt-1 text-xs text-amber-800">{lastIncident}</p>
          </div>
        </>
      ) : null}
    </Card>
  );
});

SystemHealthPanel.propTypes = {
  components: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      description: PropTypes.string,
      status: PropTypes.oneOf(['healthy', 'degraded', 'down']),
      metric: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      metricLabel: PropTypes.string,
      metricPercent: PropTypes.number,
    })
  ),
  overallStatus: PropTypes.oneOf(['healthy', 'degraded', 'down']),
  uptime: PropTypes.string,
  lastIncident: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SystemHealthPanel;