import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Calendar, Settings as SettingsIcon } from 'lucide-react';

interface Notification {
  id: string;
  type: 'approval_request' | 'approval_decision' | 'calendar_update' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'approval_request',
    title: 'New Availability Request',
    description: 'Developer User requested vacation from March 20-22, 2026',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
  },
  {
    id: '2',
    type: 'approval_decision',
    title: 'Availability Approved',
    description: 'Your vacation request for March 15-17 has been approved',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: false,
  },
  {
    id: '3',
    type: 'calendar_update',
    title: 'Calendar Updated',
    description: 'Marek added partial availability for March 18',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'System Maintenance',
    description: 'Scheduled maintenance on March 25, 2026 at 2:00 AM',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
  },
];

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'approval_request':
        return <CheckCircle size={18} className="text-blue-600" />;
      case 'approval_decision':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'calendar_update':
        return <Calendar size={18} className="text-orange-600" />;
      case 'system':
        return <SettingsIcon size={18} className="text-gray-600" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] px-12 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">
              {unreadCount} UNREAD
            </div>
            <h1 className="text-2xl font-normal text-[#000000]">Notifications</h1>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-sm text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide"
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-8">
        <div className="max-w-3xl">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-[#999999]">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-8">
              {/* Unread section */}
              {unreadNotifications.length > 0 && (
                <section>
                  <h2 className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
                    Unread
                  </h2>
                  <div className="space-y-0">
                    {unreadNotifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        onClick={() => handleMarkAsRead(notification.id)}
                        className={`py-4 cursor-pointer hover:bg-[#fafafa] transition-colors ${
                          index !== unreadNotifications.length - 1 ? 'border-b border-[#e5e5e5]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1">{getIcon(notification.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="text-sm font-medium text-[#000000]">
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#999999]">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              </div>
                            </div>
                            <p className="text-sm text-[#666666]">{notification.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Read section */}
              {readNotifications.length > 0 && (
                <section>
                  <h2 className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">
                    Earlier
                  </h2>
                  <div className="space-y-0">
                    {readNotifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        className={`py-4 ${
                          index !== readNotifications.length - 1 ? 'border-b border-[#e5e5e5]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4 opacity-60">
                          <div className="mt-1">{getIcon(notification.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="text-sm font-medium text-[#000000]">
                                {notification.title}
                              </h3>
                              <span className="text-xs text-[#999999]">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-[#666666]">{notification.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
