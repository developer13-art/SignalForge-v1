import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const LAYOUTS = {
  horizontal: 'grid grid-cols-1 sm:grid-cols-[minmax(120px,180px)_1fr] gap-x-4 gap-y-3',
  vertical: 'flex flex-col gap-4',
  inline: 'flex flex-wrap gap-x-6 gap-y-3',
};

const SIZES = {
  sm: { label: 'text-[11px]', value: 'text-xs', padding: 'py-1.5' },
  md: { label: 'text-xs', value: 'text-sm', padding: 'py-2' },
  lg: { label: 'text-sm', value: 'text-base', padding: 'py-3' },
};

const DescriptionList = forwardRef(function DescriptionList(
  {
    items = [],
    layout = 'horizontal',
    size = 'md',
    bordered = false,
    striped = false,
    divider = true,
    labelWidth,
    className = '',
    itemClassName = '',
    labelClassName = '',
    valueClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;
  const layoutClass = LAYOUTS[layout] || LAYOUTS.horizontal;

  if (layout === 'vertical') {
    return (
      <dl
        ref={ref}
        className={[layoutClass, className].filter(Boolean).join(' ')}
        data-testid={testId}
        {...rest}
      >
        {items.map((item, index) => (
          <div
            key={item.key || item.label || index}
            className={[
              'flex flex-col gap-1',
              bordered ? 'rounded-md border border-slate-200 px-4 py-3' : '',
              striped && index % 2 === 1 ? 'bg-slate-50' : '',
              itemClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <dt
              className={[
                'font-medium text-slate-500',
                sizeConfig.label,
                labelClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {item.label}
            </dt>
            <dd
              className={[
                'text-slate-900',
                sizeConfig.value,
                valueClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  if (layout === 'inline') {
    return (
      <dl
        ref={ref}
        className={[layoutClass, className].filter(Boolean).join(' ')}
        data-testid={testId}
        {...rest}
      >
        {items.map((item, index) => (
          <div
            key={item.key || item.label || index}
            className={['flex items-baseline gap-2', itemClassName].filter(Boolean).join(' ')}
          >
            <dt
              className={[
                'font-medium text-slate-500',
                sizeConfig.label,
                labelClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {item.label}
            </dt>
            <dd
              className={['text-slate-900', sizeConfig.value, valueClassName]
                .filter(Boolean)
                .join(' ')}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl
      ref={ref}
      className={[
        layoutClass,
        divider ? 'divide-y divide-slate-200' : '',
        bordered ? 'rounded-lg border border-slate-200 bg-white overflow-hidden' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {items.map((item, index) => (
        <div
          key={item.key || item.label || index}
          className={[
            'flex items-start justify-between gap-4 px-4',
            sizeConfig.padding,
            striped && index % 2 === 1 ? 'bg-slate-50' : '',
            itemClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          style={labelWidth ? { gridTemplateColumns: `${labelWidth} 1fr` } : undefined}
        >
          <dt
            className={[
              'font-medium text-slate-500 shrink-0',
              sizeConfig.label,
              labelClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {item.label}
          </dt>
          <dd
            className={[
              'min-w-0 text-right text-slate-900',
              sizeConfig.value,
              valueClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
});

DescriptionList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.node.isRequired,
      value: PropTypes.node,
    }),
  ).isRequired,
  layout: PropTypes.oneOf(['horizontal', 'vertical', 'inline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  bordered: PropTypes.bool,
  striped: PropTypes.bool,
  divider: PropTypes.bool,
  labelWidth: PropTypes.string,
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  valueClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default DescriptionList;
export { LAYOUTS as DESCRIPTION_LIST_LAYOUTS };