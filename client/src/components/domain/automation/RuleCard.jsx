import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Zap, Play, Pause, Settings2, Trash2, ArrowRight, Activity } from 'lucide-react';
import Card from '../../common/Card';

const RuleCard = forwardRef(function RuleCard(
  {
    rule,
    onToggle,
    onEdit,
    onDelete,
    onTest,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!rule) {
    return null;
  }

  const { name, trigger, triggerLabel, action, actionLabel, enabled, priority, executions, lastTriggered } = rule;

  return (
    <Card
      ref={ref}
      padding="md"
      className={[
        'transition-opacity',
        enabled ? '' : 'opacity-60',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      testId={testId}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={[
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Zap size={16} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{name}</p>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                P{priority || 1}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="rounded bg-sky-50 px-1.5 py-0.5 font-medium text-sky-700">
                {triggerLabel || trigger}
              </span>
              <ArrowRight size={10} aria-hidden="true" />
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">
                {actionLabel || action}
              </span>
            </div>

            {executions !== undefined ? (
              <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Activity size={10} aria-hidden="true" />
                  {executions} executions
                </span>
                {lastTriggered ? <span>Last: {lastTriggered}</span> : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onToggle ? (
            <button
              type="button"
              onClick={() => onToggle(rule)}
              aria-label={enabled ? 'Disable rule' : 'Enable rule'}
              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              {enabled ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            </button>
          ) : null}

          {onTest ? (
            <button
              type="button"
              onClick={() => onTest(rule)}
              aria-label="Test rule"
              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <Activity size={14} aria-hidden="true" />
            </button>
          ) : null}

          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(rule)}
              aria-label="Edit rule"
              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <Settings2 size={14} aria-hidden="true" />
            </button>
          ) : null}

          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(rule)}
              aria-label="Delete rule"
              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  );
});

RuleCard.propTypes = {
  rule: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    trigger: PropTypes.string,
    triggerLabel: PropTypes.string,
    action: PropTypes.string,
    actionLabel: PropTypes.string,
    enabled: PropTypes.bool,
    priority: PropTypes.number,
    executions: PropTypes.number,
    lastTriggered: PropTypes.string,
  }),
  onToggle: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onTest: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RuleCard;