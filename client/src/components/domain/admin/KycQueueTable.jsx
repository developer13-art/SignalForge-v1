import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FileCheck, Eye } from 'lucide-react';
import DataTable from '../../data-display/DataTable';
import Avatar from '../../common/Avatar';
import KycStatusBadge from '../kyc/KycStatusBadge';
import EmptyState from '../../common/EmptyState';

const KycQueueTable = forwardRef(function KycQueueTable(
  {
    applications = [],
    loading = false,
    error,
    onRowClick,
    onReview,
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
        key: 'applicant',
        header: 'Applicant',
        accessor: 'applicantName',
        render: (value, row) => (
          <div className="flex items-center gap-3">
            <Avatar size="sm" src={row.avatar} name={value} alt={value} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{value}</p>
              <p className="truncate text-xs text-slate-500">{row.applicantEmail}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'documentType',
        header: 'Document',
        accessor: 'documentType',
        render: (value) => <span className="text-xs text-slate-700">{value}</span>,
      },
      {
        key: 'country',
        header: 'Country',
        accessor: 'country',
        render: (value) => <span className="text-xs text-slate-700">{value}</span>,
      },
      {
        key: 'submittedAt',
        header: 'Submitted',
        accessor: 'submittedAt',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
      {
        key: 'waitingTime',
        header: 'Waiting',
        accessor: 'waitingTime',
        render: (value) => (
          <span
            className={[
              'text-xs font-medium',
              value && value.startsWith('>') ? 'text-rose-600' : 'text-slate-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {value}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        align: 'right',
        render: (value) => <KycStatusBadge status={value} size="xs" />,
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (value, row) =>
          onReview ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onReview(row);
              }}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <Eye size={11} aria-hidden="true" />
              Review
            </button>
          ) : null,
      },
    ],
    [onReview]
  );

  return (
    <DataTable
      ref={ref}
      columns={columns}
      rows={applications}
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
          icon={FileCheck}
          title="No KYC applications"
          description="There are no pending applications in the queue."
          size="sm"
        />
      }
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

KycQueueTable.propTypes = {
  applications: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRowClick: PropTypes.func,
  onReview: PropTypes.func,
  selectable: PropTypes.bool,
  selectedKeys: PropTypes.array,
  onSelectionChange: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default KycQueueTable;