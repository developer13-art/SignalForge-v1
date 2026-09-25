import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Award, MoreHorizontal } from 'lucide-react';
import DataTable from '../../data-display/DataTable';
import Avatar from '../../common/Avatar';
import ProviderCertificationBadge from '../provider/ProviderCertificationBadge';
import Dropdown from '../../common/Dropdown';
import EmptyState from '../../common/EmptyState';

const ProviderTable = forwardRef(function ProviderTable(
  {
    providers = [],
    loading = false,
    error,
    onRowClick,
    onView,
    onApprove,
    onSuspend,
    selectable = false,
    selectedKeys = [],
    onSelectionChange,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const columns = useMemo(
    () => [
      {
        key: 'provider',
        header: 'Provider',
        accessor: 'name',
        render: (value, row) => (
          <div className="flex items-center gap-3">
            <Avatar
              size="sm"
              src={row.avatar}
              name={value}
              alt={value}
              status={row.verified ? 'verified' : undefined}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{value}</p>
              <p className="truncate text-xs text-slate-500">{row.email || row.channel || '—'}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'certification',
        header: 'Certification',
        accessor: 'certification',
        render: (value) =>
          value ? <ProviderCertificationBadge level={value} size="xs" /> : <span className="text-xs text-slate-400">Uncertified</span>,
      },
      {
        key: 'subscribers',
        header: 'Subscribers',
        accessor: 'subscribers',
        align: 'right',
        render: (value) => <span className="text-sm font-medium text-slate-700">{value || 0}</span>,
      },
      {
        key: 'winRate',
        header: 'Win Rate',
        accessor: 'winRate',
        align: 'right',
        render: (value) => (
          <span className="text-sm font-medium text-emerald-600">
            {value !== undefined ? `${value}%` : '—'}
          </span>
        ),
      },
      {
        key: 'signalsSent',
        header: 'Signals',
        accessor: 'signalsSent',
        align: 'right',
        render: (value) => <span className="text-sm text-slate-700">{value || 0}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        align: 'right',
        render: (value) => {
          const configs = {
            active: 'bg-emerald-50 text-emerald-700',
            pending: 'bg-amber-50 text-amber-700',
            suspended: 'bg-rose-50 text-rose-700',
            certified: 'bg-indigo-50 text-indigo-700',
          };
          return (
            <span
              className={[
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                configs[value] || 'bg-slate-100 text-slate-600',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {value}
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (value, row) => (
          <Dropdown
            items={[
              { key: 'view', label: 'View Profile', onClick: () => onView && onView(row) },
              { type: 'divider', key: 'd1' },
              row.status === 'pending'
                ? { key: 'approve', label: 'Approve Provider', onClick: () => onApprove && onApprove(row) }
                : null,
              row.status === 'active'
                ? {
                    key: 'suspend',
                    label: 'Suspend Provider',
                    danger: true,
                    onClick: () => onSuspend && onSuspend(row),
                  }
                : null,
            ].filter(Boolean)}
          >
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              aria-label="Actions"
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <MoreHorizontal size={14} aria-hidden="true" />
            </button>
          </Dropdown>
        ),
      },
    ],
    [onView, onApprove, onSuspend]
  );

  return (
    <DataTable
      ref={ref}
      columns={columns}
      rows={providers}
      rowKey="id"
      loading={loading}
      error={error}
      searchable
      sortable
      selectable={selectable}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
      onRowClick={onRowClick}
      emptyState={
        <EmptyState
          icon={Award}
          title="No providers found"
          description="No providers match your current filters."
          size="sm"
        />
      }
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

ProviderTable.propTypes = {
  providers: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRowClick: PropTypes.func,
  onView: PropTypes.func,
  onApprove: PropTypes.func,
  onSuspend: PropTypes.func,
  selectable: PropTypes.bool,
  selectedKeys: PropTypes.array,
  onSelectionChange: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ProviderTable;