import { useEffect, useRef, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from './client';
import { TEMPLATE_LABELS } from './presentation';
import type { Notification } from './types';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  function load() {
    listNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleItemClick(notification: Notification) {
    if (!notification.is_read) {
      await markNotificationRead(notification.id).catch(() => undefined);
      load();
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead().catch(() => undefined);
    load();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        title="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-ink-200 text-ink-500 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
      >
        <Bell size={18} />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cente-red-600"></span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-sm border border-ink-100 bg-white shadow-lg dark:border-ink-700 dark:bg-ink-900">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-800">
            <strong className="text-sm text-ink-700 dark:text-ink-100">Notifications</strong>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-cente-blue-600 hover:underline"
            >
              <Check size={12} />
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-400">No notifications.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleItemClick(notification)}
                  className={`flex w-full flex-col gap-0.5 border-b border-ink-50 px-4 py-3 text-left last:border-b-0 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800 ${
                    notification.is_read ? '' : 'bg-cente-blue-50/40 dark:bg-ink-800/60'
                  }`}
                >
                  <span className="text-sm text-ink-700 dark:text-ink-100">
                    {TEMPLATE_LABELS[notification.template_code] ?? notification.template_code}
                  </span>
                  <span className="text-xs text-ink-400">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
