import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { User, Ban, MoreHorizontal } from 'lucide-react';
import DataTable from '../../data-display/DataTable';
import Avatar from '../../common/Avatar';
import KycStatusBadge from '../kyc/KycStatusBadge';
import SubscriptionStatusBadge from '../subscription/SubscriptionStatusBadge';
import Dropdown from '../../common/Dropdown';
import EmptyState from '../../common/EmptyState';

const UserTable = forwardRef(function UserTable(
  {
    users = [],
    loading = false,
    error,
    onRowClick,
    onViewDetails,
    onSuspend,
    onActivate,
    onImpersonate,
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
        key: 'user',
        header: 'User',
        accessor: 'name',
        render: (value, row) => (
          <div className="flex items-center gap-3">
            <Avatar size="sm" src={row.avatar} name={value} alt={value} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{value}</p>
              <p className="truncate text-xs text-slate-500">{row.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        accessor: 'role',
        render: (value) => (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-700">
            {value}
          </span>
        ),
      },
      {
        key: 'kycStatus',
        header: 'KYC',
        accessor: 'kycStatus',
        render: (value) => <KycStatusBadge status={value} size="xs" />,
      },
      {
        key: 'subscriptionStatus',
        header: 'Subscription',
        accessor: 'subscriptionStatus',
        render: (value) => <SubscriptionStatusBadge status={value} size="xs" />,
      },
      {
        key: 'joinedAt',
        header: 'Joined',
        accessor: 'joinedAt',
        align: 'right',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
      {
        key: 'lastActive',
        header: 'Last Active',
        accessor: 'lastActive',
        align: 'right',
        render: (value) => <span className="text-xs text-slate-500">{value || '—'}</span>,
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (value, row) => (
          <Dropdown
            items={[
              { key: 'view', label: 'View Details', onClick: () => onViewDetails && onViewDetails(row) },
              { type: 'divider', key: 'd1' },
              row.suspended
                ? { key: 'activate', label: 'Activate User', onClick: () => onActivate && onActivate(row) }
                : { key: 'suspend', label: 'Suspend User', danger: true, onClick: () => onSuspend && onSuspend(row) },
              { key: 'impersonate', label: 'Impersonate', onClick: () => onImpersonate && onImpersonate(row) },
            ]}
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
    [onViewDetails, onSuspend, onActivate, onImpersonate]
  );

  return (
    <DataTable
      ref={ref}
      columns={columns}
      rows={users}
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
          icon={User}
          title="No users found"
          description="No users match your current filters."
          size="sm"
        />
      }
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

UserTable.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRowClick: PropTypes.func,
  onViewDetails: PropTypes.func,
  onSuspend: PropTypes.func,
  onActivate: PropTypes.func,
  onImpersonate: PropTypes.func,
  selectable: PropTypes.bool,
  selectedKeys: PropTypes.array,
  onSelectionChange: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default UserTable;