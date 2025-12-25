import React from 'react';
import { User, InboxNotification } from '../types';
import NotificationBell from './NotificationBell';
import { User, UserRole, InboxNotification } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogoClick: () => void;
  onCancel: () => void;
  notifications: InboxNotification[];
  onMarkAllAsRead: () => void;
}

function Header({ user, onLogout, onLoginClick, onRegisterClick, onLogoClick, onCancel, notifications, onMarkAllAsRead }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={onLogoClick}>
            {/* ロゴ画像 */}
            <img 
              src="/logo.png" 
              alt="Connerly" 
              className="h-10 w-auto"
            />
            {/* テキストロゴ（オプション：画像だけでもOK） */}
            <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">
              connerly
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell notifications={notifications} onMarkAllAsRead={onMarkAllAsRead} />
                <span className="text-sm text-gray-600 hidden sm:block">こんにちは、{user.name}さん</span>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100"
               >
                  解約
                 </button>
                
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent rounded-md hover:bg-gray-100"
                >
                  ログイン
                </button>
                <button
                  onClick={onRegisterClick}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  今すぐに始める
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
