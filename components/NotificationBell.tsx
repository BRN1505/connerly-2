import React, { useState, useEffect, useRef } from 'react';
import { InboxNotification } from '../types';

interface NotificationBellProps {
  notifications: InboxNotification[];
  onMarkAllAsRead: () => void;
}

function timeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "年前";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "ヶ月前";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "日前";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "時間前";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "分前";
    return "たった今";
}

function NotificationBell({ notifications, onMarkAllAsRead }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleToggle = () => {
        setIsOpen(prev => !prev);
        if (!isOpen && unreadCount > 0) {
            onMarkAllAsRead();
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <span className="sr-only">View notifications</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <div className="px-4 py-3 border-b">
                            <p className="text-sm font-semibold text-gray-900">通知</p>
                        </div>
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div key={notification.id} className={`p-4 border-b hover:bg-gray-50 ${!notification.isRead ? 'bg-indigo-50' : ''}`}>
                                    <p className="text-sm text-gray-700">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.createdAt)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center p-8">通知はありません。</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
