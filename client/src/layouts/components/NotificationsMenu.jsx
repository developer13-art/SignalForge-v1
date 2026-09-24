/**
 * NotificationsMenu
 *
 * Quick preview of the most recent in-app notifications, with a
 * shortcut to the notification center.
 *
 * @module client/src/layouts/components/NotificationsMenu
 */

import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bell, CheckCheck } from 'lucide-react';

import { selectNotifications, selectUnreadCount } from '../../store/slices/notification.slice.js';
import { cn } from '../../lib/utils/cn.util.js';

function formatRelativeTime(value) {
  if (!value) {
    return '';
  }
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsMenu({ open, onClose }) {
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  if (!open) {
    return null;
  }

  const recent = notifications.slice(0, 5);

  return (
    <div
      className={cn(
        'absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl border border-surface-border bg-surface shadow-modal animate-fade-in',
      )}
      onMouseLeave={onClose}
    >
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-text-secondary" />
          <p className="text-small font-semibold text-text-primary">Notifications</p>
        </div>
        {unreadCount > 0 ? (
          <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-caption font-medium text-primary-300">
            {unreadCount} new
          </span>
        ) : null}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <CheckCheck className="h-6 w-6 text-text-tertiary" />
            <p className="text-small text-text-secondary">You are all caught up.</p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-border">
            {recent.map((notification) => (
              <li key={notification.notificationId}>
                <Link
                  to="/notifications"
                  className="block px-4 py-3 transition-colors hover:bg-surface-subtle"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-small font-medium text-text-primary">
                      {notification.title}
                    </p>
                    <span className="whitespace-nowrap text-caption text-text-tertiary">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  {notification.body ? (
                    <p className="mt-1 line-clamp-2 text-caption text-text-secondary">
                      {notification.body}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-surface-border p-2">
        <Link
          to="/notifications"
          className="flex items-center justify-center rounded-lg py-2 text-caption font-medium text-primary-300 transition-colors hover:bg-surface-subtle"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}