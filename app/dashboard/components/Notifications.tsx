'use client';

import { useState } from 'react';
import { FiCheck, FiX, FiUserPlus, FiHeart, FiStar, FiBell } from 'react-icons/fi';

interface Notification {
  id: string;
  type: 'match' | 'request' | 'like' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
  avatar?: string | null;
  senderName?: string;
  projectName?: string;
  actionable?: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'New Match!',
    description: 'You matched 92% with EcoTrack project. Pragya wants to connect!',
    time: '5 min ago',
    read: false,
    senderName: 'Pragya Sharma',
    projectName: 'EcoTrack',
    actionable: true,
  },
  {
    id: '2',
    type: 'request',
    title: 'Collaboration Request',
    description: 'Rahul Verma wants you to join StudySync as ML Engineer',
    time: '1 hour ago',
    read: false,
    senderName: 'Rahul Verma',
    projectName: 'StudySync',
    actionable: true,
  },
  {
    id: '4',
    type: 'like',
    title: 'Profile View',
    description: 'Vikram Singh viewed your profile',
    time: '5 hours ago',
    read: true,
    senderName: 'Vikram Singh',
  },
  {
    id: '5',
    type: 'system',
    title: 'Complete Your Profile',
    description: 'Add your skills to get better project matches',
    time: '1 day ago',
    read: true,
  },
  {
    id: '6',
    type: 'match',
    title: 'Trending Project',
    description: 'CodeBuddy is looking for developers like you - 89% match!',
    time: '2 days ago',
    read: true,
    projectName: 'CodeBuddy',
    actionable: true,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <FiStar className="text-amber-400" size={16} />;
      case 'request':
        return <FiUserPlus className="text-[#B19EEF]" size={16} />;
      case 'like':
        return <FiHeart className="text-rose-400" size={16} />;
      default:
        return <FiBell className="text-gray-400" size={16} />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-[#B19EEF] text-[#0a0a0f]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              filter === 'unread'
                ? 'bg-[#B19EEF] text-[#0a0a0f]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filter === 'unread' ? 'bg-[#0a0a0f]/20 text-[#0a0a0f]' : 'bg-[#B19EEF] text-[#0a0a0f]'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-[#B19EEF] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => markAsRead(notification.id)}
            className={`group rounded-xl border p-4 transition-all duration-300 cursor-pointer ${
              notification.read
                ? 'bg-[#12121a]/50 border-white/5 hover:border-white/10'
                : 'bg-[#12121a] border-[#B19EEF]/20 hover:border-[#B19EEF]/40'
            }`}
          >
            <div className="flex gap-4">
              {/* Icon or Avatar */}
              <div className="flex-shrink-0">
                {notification.senderName ? (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B19EEF] to-[#8B7BD4] flex items-center justify-center text-sm font-semibold text-[#0a0a0f]">
                    {getInitials(notification.senderName)}
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-[#B19EEF]" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {notification.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">{notification.time}</span>
                </div>

                {/* Action Buttons */}
                {notification.actionable && !notification.read && (
                  <div className="mt-3 flex gap-2">
                    <button className="px-4 py-1.5 rounded-lg bg-[#B19EEF] text-[#0a0a0f] text-sm font-medium flex items-center gap-1.5 hover:bg-[#a08de0] transition-colors">
                      <FiCheck size={14} />
                      Accept
                    </button>
                    <button className="px-4 py-1.5 rounded-lg bg-white/5 text-gray-400 text-sm font-medium flex items-center gap-1.5 hover:bg-white/10 transition-colors">
                      <FiX size={14} />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <FiBell className="text-gray-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white">
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </h3>
          <p className="mt-2 text-gray-500">
            {filter === 'unread'
              ? "You've read all your notifications"
              : "We'll notify you when something happens"}
          </p>
        </div>
      )}
    </div>
  );
}
