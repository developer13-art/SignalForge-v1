import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  default: { dot: 'bg-slate-400', ring: 'ring-slate-100', line: 'bg-slate-200' },
  primary: { dot: 'bg-indigo-500', ring: 'ring-indigo-100', line: 'bg-indigo-200' },
  success: { dot: 'bg-emerald-500', ring: 'ring-emerald-100', line: 'bg-emerald-200' },
  warning: { dot: 'bg-amber-500', ring: 'ring-amber-100', line: 'bg-amber-200' },
  danger: { dot: 'bg-rose-500', ring: 'ring-rose-100', line: 'bg-rose-200' },
  info: { dot: 'bg-sky-500', ring: 'ring-sky-100', line: 'bg-sky-200' },
};

const SIZES = {
  sm: {
    dot: 'h-2.5 w-2.5',
    ring: 'p-1',
    title: 'text-xs font-semibold',
    description: 'text-[11px]',
    time: 'text-[10px]',
    gap: 'gap-3',
    iconSize: 10,
  },
  md: {
    dot: 'h-3 w-3',
    ring: 'p-1',
    title: 'text-sm font-semibold',
    description: 'text-xs',
    time: 'text-[11px]',
    gap: 'gap-4',
    iconSize: 12,
  },
  lg: {
    dot: 'h-3.5 w-3.5',
    ring: 'p-1.5',
    title: 'text-base font-semibold',
    description: 'text-sm',
    time: 'text-xs',
    gap: 'gap-4',
    iconSize: 14,
  },
};

const Timeline = forwardRef(function Timeline(
  {
    items = [],
    variant = 'default',
    size = 'md',
    showLine = true,
    icon: Icon,
    className = '',
    itemClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;

  return (
    <ol
      ref={ref}
      className={['relative flex flex-col', sizeConfig.gap, className]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {items.map((item, index) => {
        const itemVariant = VARIANTS[item.variant] || VARIANTS[variant] || VARIANTS.default;
        const isLast = index === items.length - 1;
        const ItemIcon = item.icon || Icon;

        return (
          <li
            key={item.key || item.id || index}
            className={['relative flex items-start', itemClassName].filter(Boolean).join(' ')}
          >
            <div className="relative flex flex-col items-center">
              <span
                className={[
                  'relative z-10 flex items-center justify-center rounded-full ring-4',
                  itemVariant.dot,
                  itemVariant.ring,
                  sizeConfig.ring,
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              >
                {ItemIcon ? (
                  <ItemIcon size={sizeConfig.iconSize} className="text-white" />
                ) : (
                  <span className={['rounded-full bg-white', sizeConfig.dot].join(' ')} />
                )}
              </span>

              {showLine && !isLast ? (
                <span
                  className={[
                    'absolute top-full left-1/2 z-0 w-px -translate-x-1/2',
                    itemVariant.line,
                    'h-full min-h-[2rem]',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
              ) : null}
            </div>

            <div className={['min-w-0 flex-1 pb-4', isLast ? 'pb-0' : ''].filter(Boolean).join(' ')}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                {item.title ? (
                  <h3 className={['text-slate-900', sizeConfig.title].filter(Boolean).join(' ')}>
                    {item.title}
                  </h3>
                ) : null}

                {item.time ? (
                  <time
                    className={['shrink-0 text-slate-400', sizeConfig.time]
                      .filter(Boolean)
                      .join(' ')}
                    dateTime={item.dateTime}
                  >
                    {item.time}
                  </time>
                ) : null}
              </div>

              {item.description ? (
                <p
                  className={['mt-1 text-slate-500', sizeConfig.description]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {item.description}
                </p>
              ) : null}

              {item.content ? <div className="mt-2">{item.content}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
});

Timeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.node,
      description: PropTypes.node,
      time: PropTypes.node,
      dateTime: PropTypes.string,
      content: PropTypes.node,
      icon: PropTypes.elementType,
      variant: PropTypes.oneOf([
        'default',
        'primary',
        'success',
        'warning',
        'danger',
        'info',
      ]),
    }),
  ).isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLine: PropTypes.bool,
  icon: PropTypes.elementType,
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default Timeline;
export { VARIANTS as TIMELINE_VARIANTS, SIZES as TIMELINE_SIZES };