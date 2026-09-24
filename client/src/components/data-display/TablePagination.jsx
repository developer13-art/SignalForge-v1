import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Pagination from '../common/Pagination';

const TablePagination = forwardRef(function TablePagination(
  {
    currentPage = 1,
    totalPages = 1,
    totalItems,
    pageSize,
    pageSizeOptions = [10, 25, 50, 100],
    onPageChange,
    onPageSizeChange,
    showPageSizeSelector = true,
    showInfo = true,
    size = 'sm',
    variant = 'minimal',
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        'flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        showPageSizeSelector={showPageSizeSelector}
        showInfo={showInfo}
        size={size}
        variant={variant}
        showFirstLast={false}
        showPageNumbers
      />
    </div>
  );
});

TablePagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  totalItems: PropTypes.number,
  pageSize: PropTypes.number,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  showPageSizeSelector: PropTypes.bool,
  showInfo: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'minimal', 'outlined']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TablePagination;