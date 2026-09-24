import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import EmptyState from '../common/EmptyState';

const TableEmptyState = forwardRef(function TableEmptyState(
  {
    colSpan = 1,
    icon,
    title = 'No records found',
    description = 'There is nothing to display here yet.',
    action,
    secondaryAction,
    variant = 'default',
    size = 'md',
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  return (
    <tr ref={ref} data-testid={testId} {...rest}>
      <td
        colSpan={colSpan}
        className={['bg-white', className].filter(Boolean).join(' ')}
      >
        <EmptyState
          icon={icon}
          title={title}
          description={description}
          action={action}
          secondaryAction={secondaryAction}
          variant={variant}
          size={size}
        />
      </td>
    </tr>
  );
});

TableEmptyState.propTypes = {
  colSpan: PropTypes.number,
  icon: PropTypes.elementType,
  title: PropTypes.node,
  description: PropTypes.node,
  action: PropTypes.node,
  secondaryAction: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'info', 'success', 'warning', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TableEmptyState;