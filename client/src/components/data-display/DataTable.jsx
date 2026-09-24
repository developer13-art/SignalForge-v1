import React, {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Filter,
  Search,
  X,
} from 'lucide-react';
import Spinner from '../common/Spinner';
import Skeleton from '../common/Skeleton';
import Pagination from '../common/Pagination';
import EmptyState from '../common/EmptyState';

const DENSITIES = {
  compact: 'py-1.5 px-3 text-xs',
  normal: 'py-3 px-4 text-sm',
  comfortable: 'py-4 px-4 text-sm',
};

const ALIGNMENTS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function resolveValue(row, accessor) {
  if (typeof accessor === 'function') {
    return accessor(row);
  }
  if (typeof accessor === 'string' && accessor.includes('.')) {
    return accessor.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), row);
  }
  return row ? row[accessor] : undefined;
}

function compareValues(a, b) {
  if (a === b) {
    return 0;
  }
  if (a === null || a === undefined) {
    return 1;
  }
  if (b === null || b === undefined) {
    return -1;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

const DataTable = forwardRef(function DataTable(
  {
    columns = [],
    rows = [],
    rowKey = 'id',
    loading = false,
    error = null,
    emptyState,
    errorState,
    density = 'normal',
    striped = false,
    hoverable = true,
    bordered = false,
    stickyHeader = false,
    selectable = false,
    selectedKeys = [],
    onSelectionChange,
    sortable = false,
    sortState,
    defaultSortState,
    onSortChange,
    searchable = false,
    searchValue,
    defaultSearchValue,
    onSearchChange,
    searchPlaceholder = 'Search',
    filterComponent,
    pagination,
    onPaginationChange,
    className = '',
    tableClassName = '',
    headerClassName = '',
    rowClassName = '',
    cellClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const isSortControlled = sortState !== undefined;
  const [internalSort, setInternalSort] = useState(
    defaultSortState || (sortable ? { key: null, direction: null } : null),
  );

  const activeSort = isSortControlled ? sortState : internalSort;

  const isSearchControlled = searchValue !== undefined;
  const [internalSearch, setInternalSearch] = useState(defaultSearchValue || '');
  const activeSearch = isSearchControlled ? searchValue : internalSearch;

  const isSelectionControlled = onSelectionChange && Array.isArray(selectedKeys);

  const [internalSelected, setInternalSelected] = useState(selectedKeys || []);
  const activeSelected = isSelectionControlled ? selectedKeys : internalSelected;

  useEffect(() => {
    if (!isSortControlled) {
      setInternalSort(defaultSortState || (sortable ? { key: null, direction: null } : null));
    }
  }, [isSortControlled, defaultSortState, sortable]);

  useEffect(() => {
    if (!isSearchControlled) {
      setInternalSearch(defaultSearchValue || '');
    }
  }, [isSearchControlled, defaultSearchValue]);

  const getRowKey = useCallback(
    (row, index) => {
      if (typeof rowKey === 'function') {
        return rowKey(row, index);
      }
      return row ? row[rowKey] : `row-${index}`;
    },
    [rowKey],
  );

  const processedRows = useMemo(() => {
    let result = Array.isArray(rows) ? [...rows] : [];

    if (searchable && activeSearch && activeSearch.trim()) {
      const query = activeSearch.trim().toLowerCase();
      result = result.filter((row) =>
        columns.some((column) => {
          if (column.searchable === false) {
            return false;
          }
          const accessor = column.accessor || column.key;
          const value = resolveValue(row, accessor);
          if (value === null || value === undefined) {
            return false;
          }
          return String(value).toLowerCase().includes(query);
        }),
      );
    }

    if (sortable && activeSort && activeSort.key && activeSort.direction) {
      const column = columns.find((col) => (col.key || col.accessor) === activeSort.key);
      if (column) {
        const accessor = column.sortAccessor || column.accessor || column.key;
        result.sort((a, b) => {
          const comparison = compareValues(resolveValue(a, accessor), resolveValue(b, accessor));
          return activeSort.direction === 'asc' ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [rows, columns, searchable, activeSearch, sortable, activeSort]);

  const handleSort = useCallback(
    (column) => {
      if (!sortable || column.sortable === false) {
        return;
      }

      const key = column.key || column.accessor;
      let nextDirection = 'asc';

      if (activeSort && activeSort.key === key) {
        if (activeSort.direction === 'asc') {
          nextDirection = 'desc';
        } else if (activeSort.direction === 'desc') {
          nextDirection = null;
        }
      }

      const nextSort = nextDirection ? { key, direction: nextDirection } : { key: null, direction: null };

      if (!isSortControlled) {
        setInternalSort(nextSort);
      }
      if (onSortChange) {
        onSortChange(nextSort);
      }
    },
    [sortable, activeSort, isSortControlled, onSortChange],
  );

  const allRowKeys = useMemo(
    () => processedRows.map((row, index) => getRowKey(row, index)),
    [processedRows, getRowKey],
  );

  const isAllSelected =
    processedRows.length > 0 && allRowKeys.every((key) => activeSelected.includes(key));
  const isPartiallySelected =
    !isAllSelected && allRowKeys.some((key) => activeSelected.includes(key));

  const updateSelection = useCallback(
    (nextSelection) => {
      if (!isSelectionControlled) {
        setInternalSelected(nextSelection);
      }
      if (onSelectionChange) {
        onSelectionChange(nextSelection);
      }
    },
    [isSelectionControlled, onSelectionChange],
  );

  const toggleRow = useCallback(
    (key) => {
      const nextSelection = activeSelected.includes(key)
        ? activeSelected.filter((k) => k !== key)
        : [...activeSelected, key];
      updateSelection(nextSelection);
    },
    [activeSelected, updateSelection],
  );

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      updateSelection(activeSelected.filter((key) => !allRowKeys.includes(key)));
    } else {
      const merged = new Set([...activeSelected, ...allRowKeys]);
      updateSelection(Array.from(merged));
    }
  }, [isAllSelected, activeSelected, allRowKeys, updateSelection]);

  const handleSearchChange = useCallback(
    (event) => {
      const value = event.target.value;
      if (!isSearchControlled) {
        setInternalSearch(value);
      }
      if (onSearchChange) {
        onSearchChange(value);
      }
    },
    [isSearchControlled, onSearchChange],
  );

  const clearSearch = useCallback(() => {
    if (!isSearchControlled) {
      setInternalSearch('');
    }
    if (onSearchChange) {
      onSearchChange('');
    }
  }, [isSearchControlled, onSearchChange]);

  const densityClass = DENSITIES[density] || DENSITIES.normal;

  const renderSortIcon = (column) => {
    if (!sortable || column.sortable === false) {
      return null;
    }
    const key = column.key || column.accessor;
    const isActive = activeSort && activeSort.key === key;

    if (!isActive || !activeSort.direction) {
      return <ChevronsUpDown size={14} className="text-slate-300" aria-hidden="true" />;
    }
    if (activeSort.direction === 'asc') {
      return <ChevronUp size={14} className="text-indigo-600" aria-hidden="true" />;
    }
    return <ChevronDown size={14} className="text-indigo-600" aria-hidden="true" />;
  };

  const renderHeader = () => (
    <thead
      className={[
        'bg-slate-50 text-xs uppercase tracking-wide text-slate-500',
        stickyHeader ? 'sticky top-0 z-10' : '',
        headerClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <tr>
        {selectable ? (
          <th className={['w-10', ALIGNMENTS.left, densityClass].join(' ')}>
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = isPartiallySelected;
                }
              }}
              onChange={toggleAll}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              aria-label="Select all rows"
            />
          </th>
        ) : null}

        {columns.map((column) => {
          const key = column.key || column.accessor;
          const isSortable = sortable && column.sortable !== false;

          return (
            <th
              key={key}
              scope="col"
              className={[
                'font-semibold',
                densityClass,
                ALIGNMENTS[column.align] || ALIGNMENTS.left,
                column.headerClassName || '',
                isSortable ? 'cursor-pointer select-none hover:text-slate-800' : '',
                column.width ? `w-[${column.width}]` : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={column.width ? { width: column.width } : undefined}
              onClick={isSortable ? () => handleSort(column) : undefined}
              aria-sort={
                activeSort && activeSort.key === key && activeSort.direction
                  ? activeSort.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              }
            >
              <span className="inline-flex items-center gap-1">
                {column.header}
                {renderSortIcon(column)}
              </span>
            </th>
          );
        })}
      </tr>
    </thead>
  );

  const renderBody = () => {
    if (loading) {
      return (
        <tbody className="divide-y divide-slate-200 bg-white">
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <tr key={`skeleton-${rowIndex}`}>
              {selectable ? (
                <td className={densityClass}>
                  <Skeleton variant="rect" height={16} width={16} />
                </td>
              ) : null}
              {columns.map((column) => (
                <td key={column.key || column.accessor} className={densityClass}>
                  <Skeleton variant="text" width="80%" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      );
    }

    if (error) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={columns.length + (selectable ? 1 : 0)}
              className="bg-white p-4"
            >
              {errorState || (
                <EmptyState
                  variant="danger"
                  title="Failed to load data"
                  description={typeof error === 'string' ? error : 'An unexpected error occurred.'}
                />
              )}
            </td>
          </tr>
        </tbody>
      );
    }

    if (processedRows.length === 0) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={columns.length + (selectable ? 1 : 0)}
              className="bg-white p-4"
            >
              {emptyState || (
                <EmptyState
                  title="No results"
                  description="There are no records to display."
                />
              )}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="divide-y divide-slate-200 bg-white">
        {processedRows.map((row, rowIndex) => {
          const key = getRowKey(row, rowIndex);
          const isSelected = activeSelected.includes(key);

          return (
            <tr
              key={key}
              className={[
                hoverable ? 'hover:bg-slate-50' : '',
                striped && rowIndex % 2 === 1 ? 'bg-slate-50/50' : '',
                isSelected ? 'bg-indigo-50' : '',
                rowClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {selectable ? (
                <td className={[densityClass, ALIGNMENTS.left].join(' ')}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRow(key)}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    aria-label={`Select row ${rowIndex + 1}`}
                  />
                </td>
              ) : null}

              {columns.map((column) => {
                const accessor = column.accessor || column.key;
                const value = resolveValue(row, accessor);

                return (
                  <td
                    key={column.key || accessor}
                    className={[
                      densityClass,
                      ALIGNMENTS[column.align] || ALIGNMENTS.left,
                      column.cellClassName || '',
                      cellClassName,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {column.render ? column.render(value, row, rowIndex) : value}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    );
  };

  return (
    <div
      ref={ref}
      className={['w-full', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {(searchable || filterComponent) ? (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {searchable ? (
            <div className="relative min-w-[200px] flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={activeSearch}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {activeSearch ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ) : null}

          {filterComponent ? (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" aria-hidden="true" />
              {filterComponent}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className={[
          'overflow-x-auto rounded-lg',
          bordered ? 'border border-slate-200' : 'border border-slate-200',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <table
          className={['min-w-full divide-y divide-slate-200', tableClassName]
            .filter(Boolean)
            .join(' ')}
        >
          {renderHeader()}
          {renderBody()}
        </table>
      </div>

      {pagination ? (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={pagination.onPageChange || onPaginationChange}
            onPageSizeChange={pagination.onPageSizeChange}
            pageSizeOptions={pagination.pageSizeOptions}
            showPageSizeSelector={pagination.showPageSizeSelector}
            showInfo={pagination.showInfo !== false}
          />
        </div>
      ) : null}
    </div>
  );
});

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      accessor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
      header: PropTypes.node.isRequired,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      sortable: PropTypes.bool,
      sortAccessor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
      searchable: PropTypes.bool,
      render: PropTypes.func,
      headerClassName: PropTypes.string,
      cellClassName: PropTypes.string,
    }),
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object),
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  emptyState: PropTypes.node,
  errorState: PropTypes.node,
  density: PropTypes.oneOf(['compact', 'normal', 'comfortable']),
  striped: PropTypes.bool,
  hoverable: PropTypes.bool,
  bordered: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  selectable: PropTypes.bool,
  selectedKeys: PropTypes.array,
  onSelectionChange: PropTypes.func,
  sortable: PropTypes.bool,
  sortState: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc', null]),
  }),
  defaultSortState: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc', null]),
  }),
  onSortChange: PropTypes.func,
  searchable: PropTypes.bool,
  searchValue: PropTypes.string,
  defaultSearchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  filterComponent: PropTypes.node,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    totalItems: PropTypes.number,
    pageSize: PropTypes.number,
    pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    showPageSizeSelector: PropTypes.bool,
    showInfo: PropTypes.bool,
  }),
  onPaginationChange: PropTypes.func,
  className: PropTypes.string,
  tableClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  rowClassName: PropTypes.string,
  cellClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default DataTable;
export { DENSITIES as DATA_TABLE_DENSITIES };