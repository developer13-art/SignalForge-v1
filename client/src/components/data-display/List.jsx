import React, { forwardRef, Fragment } from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  default: 'divide-y divide-slate-200',
  bordered: 'divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden',
  spaced: 'space-y-2',
  plain: '',
};

const List = forwardRef(function List(
  {
    children,
    items,
    renderItem,
    keyExtractor,
    variant = 'default',
    size = 'md',
    separator,
    header,
    footer,
    emptyState,
    className = '',
    itemClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeClass =
    size === 'sm' ? 'py-2 px-3 text-xs' : size === 'lg' ? 'py-4 px-5 text-base' : 'py-3 px-4 text-sm';

  const variantClass = VARIANTS[variant] || VARIANTS.default;

  const getKey = (item, index) => {
    if (keyExtractor) {
      return keyExtractor(item, index);
    }
    if (item && item.id !== undefined) {
      return item.id;
    }
    return `item-${index}`;
  };

  const hasContent = (items && items.length > 0) || children;

  return (
    <div
      ref={ref}
      className={['w-full', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {header ? <div className="mb-3">{header}</div> : null}

      {hasContent ? (
        items ? (
          <ul className={['bg-white', variantClass].filter(Boolean).join(' ')}>
            {items.map((item, index) => (
              <Fragment key={getKey(item, index)}>
                <li
                  className={[
                    variant !== 'spaced' ? sizeClass : '',
                    variant === 'spaced'
                      ? 'rounded-lg border border-slate-200 bg-white py-3 px-4'
                      : '',
                    itemClassName,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {renderItem ? renderItem(item, index) : item}
                </li>
                {separator && index < items.length - 1 && variant === 'spaced' ? (
                  <li className="h-2" aria-hidden="true" />
                ) : null}
              </Fragment>
            ))}
          </ul>
        ) : (
          <div className={['bg-white', variantClass].filter(Boolean).join(' ')}>{children}</div>
        )
      ) : (
        <div>{emptyState || null}</div>
      )}

      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
});

List.propTypes = {
  children: PropTypes.node,
  items: PropTypes.arrayOf(PropTypes.any),
  renderItem: PropTypes.func,
  keyExtractor: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'bordered', 'spaced', 'plain']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  separator: PropTypes.bool,
  header: PropTypes.node,
  footer: PropTypes.node,
  emptyState: PropTypes.node,
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default List;
export { VARIANTS as LIST_VARIANTS };