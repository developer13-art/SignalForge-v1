import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Avatar from '../common/Avatar';
import EmptyState from '../common/EmptyState';

const SIZES = {
  sm: {
    avatar: 'xs',
    wrapper: 'gap-3 py-2',
    title: 'text-xs',
    description: 'text-[11px]',
    time: 'text-[10px]',
  },
  md: {
    avatar: 'sm',
    wrapper: 'gap-3 py-3',
    title: 'text-sm',
    description: 'text-xs',
    time: 'text-[11px]',
  },
  lg: {
    avatar: 'md',
    wrapper: 'gap-4 py-4',
    title: 'text-base',
    description: 'text-sm',
    time: 'text-xs',
  },
};

const ActivityFeed = forwardRef(function ActivityFeed(
  {
    items = [],
    size = 'md',
    showAvatars = true,
    bordered = true,
    emptyState,
    maxItems,
    className = '',
    itemClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;

  const visibleItems =
    typeof maxItems === 'number' && maxItems > 0 ? items.slice(0, maxItems) : items;

  if (visibleItems.length === 0) {
    return (
      <div
        ref={ref}
        className={['w-full', className].filter(Boolean).join(' ')}
        data-testid={testId}
        {...rest}
      >
        {emptyState || (
          <EmptyState
            title="No activity"
            description="Recent activity will appear here."
            size="sm"
          />
        )}
      </div>
    );
  }

  return (
    <ul
      ref={ref}
      className={[
        'w-full',
        bordered ? 'divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {visibleItems.map((item, index) => (
        <li
          key={item.key || item.id || index}
          className={[
            'flex items-start px-4',
            sizeConfig.wrapper,
            itemClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {showAvatars ? (
            item.avatar ? (
              <Avatar
                size={sizeConfig.avatar}
                src={item.avatar.src || item.avatar}
                name={item.avatar.name || item.actor || item.user}
                alt={item.avatar.name || item.actor || item.user}
              />
            ) : item.icon ? (
              <span
                className={[
                  'flex shrink-0 items-center justify-center rounded-full',
                  item.iconBg || 'bg-slate-100',
                  item.iconColor || 'text-slate-600',
                  size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <item.icon size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} aria-hidden="true" />
              </span>
            ) : null
          ) : null}

          <div className="min-w-0 flex-1">
            <p className={['text-slate-900', sizeConfig.title].filter(Boolean).join(' ')}>
              {item.title}
            </p>

            {item.description ? (
              <p
                className={['mt-0.5 text-slate-500', sizeConfig.description]
                  .filter(Boolean)
                  .join(' ')}
              >
                {item.description}
              </p>
            ) : null}
          </div>

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
        </li>
      ))}
    </ul>
  );
});

ActivityFeed.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      avatar: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          src: PropTypes.string,
          name: PropTypes.string,
        }),
      ]),
      icon: PropTypes.elementType,
      iconBg: PropTypes.string,
      iconColor: PropTypes.string,
      actor: PropTypes.string,
      user: PropTypes.string,
      title: PropTypes.node.isRequired,
      description: PropTypes.node,
      time: PropTypes.node,
      dateTime: PropTypes.string,
    }),
  ),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showAvatars: PropTypes.bool,
  bordered: PropTypes.bool,
  emptyState: PropTypes.node,
  maxItems: PropTypes.number,
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default ActivityFeed;
export { SIZES as ACTIVITY_FEED_SIZES };