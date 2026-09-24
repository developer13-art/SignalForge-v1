import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

const SIZES = {
  sm: { button: 'h-7 min-w-7 px-1.5 text-xs', icon: 12, gap: 'gap-0.5' },
  md: { button: 'h-9 min-w-9 px-2 text-sm', icon: 14, gap: 'gap-1' },
  lg: { button: 'h-11 min-w-11 px-3 text-base', icon: 16, gap: 'gap-1.5' },
};

const VARIANTS = {
  default: {
    button: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    active: 'border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700',
    disabled: 'border border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed',
    ellipsis: 'border border-transparent bg-transparent text-slate-400',
  },
  minimal: {
    button: 'border-0 bg-transparent text-slate-600 hover:bg-slate-100',
    active: 'border-0 bg-indigo-600 text-white hover:bg-indigo-700',
    disabled: 'border-0 bg-transparent text-slate-300 cursor-not-allowed',
    ellipsis: 'border-0 bg-transparent text-slate-400',
  },
  outlined: {
    button: 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
    active: 'border border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50',
    disabled: 'border border-slate-200 bg-white text-slate-300 cursor-not-allowed',
    ellipsis: 'border border-transparent bg-transparent text-slate-400',
  },
};

function range(start, end) {
  const result = [];
  for (let i = start; i <= end; i += 1) {
    result.push(i);
  }
  return result;
}

function getPaginationItems(currentPage, totalPages, siblingCount = 1) {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = range(1, leftItemCount);
    return [...leftRange, 'ellipsis-right', lastPageIndex];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = range(totalPages - rightItemCount + 1, totalPages);
    return [firstPageIndex, 'ellipsis-left', ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [firstPageIndex, 'ellipsis-left', ...middleRange, 'ellipsis-right', lastPageIndex];
  }

  return range(1, totalPages);
}

const Pagination = forwardRef(function Pagination(
  {
    currentPage = 1,
    totalPages = 1,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100],
    siblingCount = 1,
    size = 'md',
    variant = 'default',
    showFirstLast = true,
    showPrevNext = true,
    showPageNumbers = true,
    showPageSizeSelector = false,
    showInfo = true,
    disabled = false,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;
  const variantConfig = VARIANTS[variant] || VARIANTS.default;

  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  const pages = useMemo(
    () => getPaginationItems(safeCurrentPage, safeTotalPages, siblingCount),
    [safeCurrentPage, safeTotalPages, siblingCount],
  );

  const handleChange = (nextPage) => {
    if (disabled) {
      return;
    }
    if (nextPage < 1 || nextPage > safeTotalPages || nextPage === safeCurrentPage) {
      return;
    }
    if (onPageChange) {
      onPageChange(nextPage);
    }
  };

  const isFirstPage = safeCurrentPage === 1;
  const isLastPage = safeCurrentPage === safeTotalPages;

  const startItem = totalItems && pageSize ? (safeCurrentPage - 1) * pageSize + 1 : undefined;
  const endItem = totalItems && pageSize
    ? Math.min(safeCurrentPage * pageSize, totalItems)
    : undefined;

  const buttonBaseClass =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1';

  const getButtonClass = (state) => {
    if (state === 'active') {
      return [buttonBaseClass, sizeConfig.button, variantConfig.active].join(' ');
    }
    if (state === 'disabled') {
      return [buttonBaseClass, sizeConfig.button, variantConfig.disabled].join(' ');
    }
    if (state === 'ellipsis') {
      return [buttonBaseClass, sizeConfig.button, variantConfig.ellipsis].join(' ');
    }
    return [buttonBaseClass, sizeConfig.button, variantConfig.button].join(' ');
  };

  return (
    <div
      ref={ref}
      className={[
        'flex flex-col items-center justify-between gap-3 sm:flex-row',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showInfo ? (
        <div className="text-xs text-slate-500">
          {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
            <>
              Showing <span className="font-medium text-slate-700">{startItem}</span> to{' '}
              <span className="font-medium text-slate-700">{endItem}</span> of{' '}
              <span className="font-medium text-slate-700">{totalItems}</span> results
            </>
          ) : (
            <>
              Page <span className="font-medium text-slate-700">{safeCurrentPage}</span> of{' '}
              <span className="font-medium text-slate-700">{safeTotalPages}</span>
            </>
          )}
        </div>
      ) : null}

      <div className={['flex items-center', sizeConfig.gap].join(' ')}>
        {showFirstLast ? (
          <button
            type="button"
            onClick={() => handleChange(1)}
            disabled={disabled || isFirstPage}
            className={getButtonClass(disabled || isFirstPage ? 'disabled' : 'default')}
            aria-label="First page"
          >
            <ChevronsLeft size={sizeConfig.icon} aria-hidden="true" />
          </button>
        ) : null}

        {showPrevNext ? (
          <button
            type="button"
            onClick={() => handleChange(safeCurrentPage - 1)}
            disabled={disabled || isFirstPage}
            className={getButtonClass(disabled || isFirstPage ? 'disabled' : 'default')}
            aria-label="Previous page"
          >
            <ChevronLeft size={sizeConfig.icon} aria-hidden="true" />
          </button>
        ) : null}

        {showPageNumbers
          ? pages.map((page, index) => {
              if (page === 'ellipsis-left' || page === 'ellipsis-right') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className={getButtonClass('ellipsis')}
                    aria-hidden="true"
                  >
                    <MoreHorizontal size={sizeConfig.icon} />
                  </span>
                );
              }

              const isActive = page === safeCurrentPage;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => handleChange(page)}
                  disabled={disabled}
                  className={getButtonClass(isActive ? 'active' : disabled ? 'disabled' : 'default')}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </button>
              );
            })
          : null}

        {showPrevNext ? (
          <button
            type="button"
            onClick={() => handleChange(safeCurrentPage + 1)}
            disabled={disabled || isLastPage}
            className={getButtonClass(disabled || isLastPage ? 'disabled' : 'default')}
            aria-label="Next page"
          >
            <ChevronRight size={sizeConfig.icon} aria-hidden="true" />
          </button>
        ) : null}

        {showFirstLast ? (
          <button
            type="button"
            onClick={() => handleChange(safeTotalPages)}
            disabled={disabled || isLastPage}
            className={getButtonClass(disabled || isLastPage ? 'disabled' : 'default')}
            aria-label="Last page"
          >
            <ChevronsRight size={sizeConfig.icon} aria-hidden="true" />
          </button>
        ) : null}

        {showPageSizeSelector && onPageSizeChange && pageSize !== undefined ? (
          <div className="ml-2 flex items-center gap-2">
            <label htmlFor="pagination-page-size" className="text-xs text-slate-500">
              Per page
            </label>
            <select
              id="pagination-page-size"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              disabled={disabled}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
    </div>
  );
});

Pagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  totalItems: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  siblingCount: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'minimal', 'outlined']),
  showFirstLast: PropTypes.bool,
  showPrevNext: PropTypes.bool,
  showPageNumbers: PropTypes.bool,
  showPageSizeSelector: PropTypes.bool,
  showInfo: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default Pagination;
export { SIZES as PAGINATION_SIZES, VARIANTS as PAGINATION_VARIANTS };