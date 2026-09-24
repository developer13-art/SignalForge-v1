import React, {
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import Spinner from '../common/Spinner';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import Pagination from '../common/Pagination';
import Skeleton from '../common/Skeleton';

const DEFAULT_COLUMNS = {
  xs: 'grid-cols-1',
  sm: 'grid-cols-1 sm:grid-cols-2',
  md: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  lg: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  xl: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5',
};

const DataGrid = forwardRef(function DataGrid(
  {
    items = [],
    renderItem,
    keyExtractor,
    loading = false,
    error = null,
    emptyState,
    errorState,
    columns = 'md',
    gap = 'md',
    searchable = false,
    searchValue,
    defaultSearchValue,
    onSearchChange,
    searchPlaceholder = 'Search',
    searchAccessor,
    filterComponent,
    sortComponent,
    toolbar,
    pagination,
    onPaginationChange,
    selectable = false,
    selectedKeys = [],
    onSelectionChange,
    className = '',
    gridClassName = '',
    itemClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const isSearchControlled = searchValue !== undefined;
  const [internalSearch, setInternalSearch] = useState(defaultSearchValue || '');
  const activeSearch = isSearchControlled ? searchValue : internalSearch;

  const isSelectionControlled = onSelectionChange && Array.isArray(selectedKeys);
  const [internalSelected, setInternalSelected] = useState(selectedKeys || []);
  const activeSelected = isSelectionControlled ? selectedKeys : internalSelected;

  const updateSelection = useCallback(
    (next) => {
      if (!isSelectionControlled) {
        setInternalSelected(next);
      }
      if (onSelectionChange) {
        onSelectionChange(next);
      }
    },
    [isSelectionControlled, onSelectionChange],
  );

  const getKey = useCallback(
    (item, index) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      return item && (item.id !== undefined ? item.id : `item-${index}`);
    },
    [keyExtractor],
  );

  const processedItems = useMemo(() => {
    let result = Array.isArray(items) ? [...items] : [];

    if (searchable && activeSearch && activeSearch.trim()) {
      const query = activeSearch.trim().toLowerCase();
      result = result.filter((item) => {
        if (searchAccessor) {
          const value = searchAccessor(item);
          return value !== null && value !== undefined && String(value).toLowerCase().includes(query);
        }
        return Object.values(item || {}).some(
          (value) =>
            value !== null && value !== undefined && String(value).toLowerCase().includes(query),
        );
      });
    }

    return result;
  }, [items, searchable, activeSearch, searchAccessor]);

  const allKeys = useMemo(
    () => processedItems.map((item, index) => getKey(item, index)),
    [processedItems, getKey],
  );

  const isAllSelected = allKeys.length > 0 && allKeys.every((key) => activeSelected.includes(key));
  const isPartiallySelected = !isAllSelected && allKeys.some((key) => activeSelected.includes(key));

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

  const toggleItem = useCallback(
    (key) => {
      const next = activeSelected.includes(key)
        ? activeSelected.filter((k) => k !== key)
        : [...activeSelected, key];
      updateSelection(next);
    },
    [activeSelected, updateSelection],
  );

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      updateSelection(activeSelected.filter((key) => !allKeys.includes(key)));
    } else {
      const merged = new Set([...activeSelected, ...allKeys]);
      updateSelection(Array.from(merged));
    }
  }, [isAllSelected, activeSelected, allKeys, updateSelection]);

  const gapClass =
    gap === 'sm' ? 'gap-3' : gap === 'lg' ? 'gap-6' : gap === 'xl' ? 'gap-8' : 'gap-4';

  const columnsClass = DEFAULT_COLUMNS[columns] || DEFAULT_COLUMNS.md;

  const renderSkeletons = () =>
    Array.from({ length: 6 }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className={[
          'rounded-lg border border-slate-200 bg-white p-4',
          itemClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Skeleton variant="rect" height={120} />
        <div className="mt-3 space-y-2">
          <Skeleton variant="title" width="70%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    ));

  const renderBody = () => {
    if (loading) {
      return <div className={[columnsClass, gapClass, 'grid'].join(' ')}>{renderSkeletons()}</div>;
    }

    if (error) {
      return (
        errorState || (
          <ErrorState
            title="Failed to load items"
            description={typeof error === 'string' ? error : 'An unexpected error occurred.'}
          />
        )
      );
    }

    if (processedItems.length === 0) {
      return (
        emptyState || (
          <EmptyState
            title="No items found"
            description={activeSearch ? 'Try adjusting your search query.' : 'Nothing to display.'}
          />
        )
      );
    }

    return (
      <div className={[columnsClass, gapClass, 'grid', gridClassName].filter(Boolean).join(' ')}>
        {processedItems.map((item, index) => {
          const key = getKey(item, index);
          const isSelected = activeSelected.includes(key);

          return (
            <div
              key={key}
              className={[
                'relative',
                isSelected ? 'rounded-lg ring-2 ring-indigo-500 ring-offset-2' : '',
                itemClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {selectable ? (
                <div className="absolute left-3 top-3 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItem(key)}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    aria-label={`Select item ${index + 1}`}
                  />
                </div>
              ) : null}
              {renderItem(item, index, { isSelected, toggleItem, key })}
            </div>
          );
        })}
      </div>
    );
  };

  const showToolbar =
    searchable || filterComponent || sortComponent || toolbar || (selectable && allKeys.length > 0);

  return (
    <div
      ref={ref}
      className={['w-full', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showToolbar ? (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {searchable ? (
            <div className="relative min-w-[240px] flex-1">
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

          {selectable && allKeys.length > 0 ? (
            <label className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700">
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
              />
              {isAllSelected ? 'Deselect all' : 'Select all'}
              {activeSelected.length > 0 ? (
                <span className="rounded-full bg-indigo-100 px-2 text-[10px] font-semibold text-indigo-700">
                  {activeSelected.length}
                </span>
              ) : null}
            </label>
          ) : null}

          {filterComponent ? (
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-slate-400" aria-hidden="true" />
              {filterComponent}
            </div>
          ) : null}

          {sortComponent ? <div>{sortComponent}</div> : null}

          {toolbar ? <div className="ml-auto flex items-center gap-2">{toolbar}</div> : null}
        </div>
      ) : null}

      {renderBody()}

      {pagination ? (
        <div className="mt-6">
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

DataGrid.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any),
  renderItem: PropTypes.func.isRequired,
  keyExtractor: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  emptyState: PropTypes.node,
  errorState: PropTypes.node,
  columns: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  gap: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  searchable: PropTypes.bool,
  searchValue: PropTypes.string,
  defaultSearchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  searchAccessor: PropTypes.func,
  filterComponent: PropTypes.node,
  sortComponent: PropTypes.node,
  toolbar: PropTypes.node,
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
  selectable: PropTypes.bool,
  selectedKeys: PropTypes.array,
  onSelectionChange: PropTypes.func,
  className: PropTypes.string,
  gridClassName: PropTypes.string,
  itemClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default DataGrid;