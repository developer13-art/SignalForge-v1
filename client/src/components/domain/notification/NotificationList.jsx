import React, { forwardRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Bell, CheckCheck } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import NotificationItem from './NotificationItem';
import EmptyState from '../../common/EmptyState';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'trade', label: 'Trades' },
  { value: 'signal', label: 'Signals' },
  { value: 'kyc', label: 'KYC' },
  { value: 'payment', label: 'Payments' },
  { value: 'referral', label: 'Referrals' },
];

const NotificationList = forwardRef(function NotificationList(
  {
    notifications = [],
    loading = false,
    onItemClick,
    onMarkRead,
    onDelete,
    onMarkAllRead,
    showFilters = true,
    maxHeight,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return notifications;
    }
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <Card ref={ref} padding="none" className={className} testId={testId} {...rest}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Bell size={14} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 ? (
              <p className="text-[11px] text-slate-500">{unreadCount} unread</p>
            ) : null}
          </div>
        </div>

        {onMarkAllRead && unreadCount > 0 ? (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
          >
            <CheckCheck size={12} aria-hidden="true" />
            Mark all read
          </button>
        ) : null}
      </div>

      {showFilters ? (
        <>
          <div className="flex flex-wrap gap-1 border-b border-slate-200 px-3 py-2">
            {FILTERS.map((f) => {
              const isActive = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={[
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <div
        className="overflow-y-auto p-3"
        style={{ maxHeight: maxHeight || undefined }}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            description="You are all caught up."
            size="sm"
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={onItemClick}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
});

NotificationList.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  onItemClick: PropTypes.func,
  onMarkRead: PropTypes.func,
  onDelete: PropTypes.func,
  onMarkAllRead: PropTypes.func,
  showFilters: PropTypes.bool,
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default NotificationList;
export { FILTERS as NOTIFICATION_FILTERS };