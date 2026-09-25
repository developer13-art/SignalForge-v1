import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FileText, User, Shield, Zap, CreditCard } from 'lucide-react';
import DataTable from '../../data-display/DataTable';
import EmptyState from '../../common/EmptyState';

const ACTION_ICONS = {
  user: User,
  admin: Shield,
  trade: Zap,
  signal: Zap,
  payment: CreditCard,
  kyc: Shield,
  system: FileText,
  default: FileText,
};

const SEVERITY_COLORS = {
  info: 'bg-sky-50 text-sky-700',
  warning: 'bg-amber-50 text-amber-700',
  critical: 'bg-rose-50 text-rose-700',
};

const AuditLogTable = forwardRef(function AuditLogTable(
  {
    logs = [],
    loading = false,
    error,
    onRowClick,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const columns = useMemo(
    () => [
      {
        key: 'category',
        header: 'Category',
        accessor: 'category',
        render: (value) => {
          const Icon = ACTION_ICONS[value] || ACTION_ICONS.default;
          return (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-700">
              <Icon size={11} aria-hidden="true" />
              {value}
            </span>
          );
        },
      },
      {
        key: 'action',
        header: 'Action',
        accessor: 'action',
        render: (value) => <span className="text-sm font-medium text-slate-800">{value}</span>,
      },
      {
        key: 'actor',
        header: 'Actor',
        accessor: 'actor',
        render: (value, row) => (
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-700">{value}</p>
            {row.actorEmail ? (
              <p className="truncate text-[11px] text-slate-500">{row.actorEmail}</p>
            ) : null}
          </div>
        ),
      },
      {
        key: 'resource',
        header: 'Resource',
        accessor: 'resource',
        render: (value) => (
          <span className="font-mono text-xs text-slate-600">{value || '—'}</span>
        ),
      },
      {
        key: 'severity',
        header: 'Severity',
        accessor: 'severity',
        align: 'right',
        render: (value) => (
          <span
            className={[
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
              SEVERITY_COLORS[value] || 'bg-slate-100 text-slate-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {value || 'info'}
          </span>
        ),
      },
      {
        key: 'ip',
        header: 'IP',
        accessor: 'ip',
        align: 'right',
        render: (value) => (
          <span className="font-mono text-[11px] text-slate-500">{value || '—'}</span>
        ),
      },
      {
        key: 'timestamp',
        header: 'Timestamp',
        accessor: 'timestamp',
        align: 'right',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
    ],
    []
  );

  return (
    <DataTable
      ref={ref}
      columns={columns}
      rows={logs}
      rowKey="id"
      loading={loading}
      error={error}
      searchable
      sortable
      onRowClick={onRowClick}
      emptyState={
        <EmptyState
          icon={FileText}
          title="No audit logs"
          description="Audit events will appear here as they are recorded."
          size="sm"
        />
      }
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

AuditLogTable.propTypes = {
  logs: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRowClick: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default AuditLogTable;