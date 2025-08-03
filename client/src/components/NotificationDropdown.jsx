import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../stores/authStore';
import useNotificationStore from '../stores/notificationStore';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Global');
  const [notifications, setNotifications] = useState({
    Global: [],
    Following: [],
    Personal: [],
    Sent: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const accessToken = useAuthStore((state) => state.accessToken);
  
  // Subscribe to the notification store
  const { 
    fetchNotifications, 
    notifications: sentNotifications, 
    loading: sentLoading,
    error: sentError 
  } = useNotificationStore();

  const tabs = [
    { id: 'Global', label: 'Global', count: notifications.Global.length },
    { id: 'Following', label: 'Following', count: notifications.Following.length },
    { id: 'Personal', label: 'Personal', count: notifications.Personal.length },
    { id: 'Sent', label: 'Sent', count: notifications.Sent.length }
  ];

  const deduplicateNotifications = (notifications) => {
    const seen = new Set();
    const deduplicated = [];

    for (const notif of notifications) {
      if (notif.notification_type === "global" || notif.notification_type === "follow") {
        const signature = `${notif.message}-${notif.url}-${notif.notification_type}`;
        if (!seen.has(signature)) {
          seen.add(signature);
          deduplicated.push(notif);
        }
      } else {
        deduplicated.push(notif);
      }
    }

    return deduplicated;
  };

  // Separate effect for sent notifications to ensure proper subscription
  useEffect(() => {
    if (!isOpen) return;
    
    // Fetch sent notifications when dropdown opens
    fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // Update sent notifications when store changes
  useEffect(() => {
    if (sentNotifications && sentNotifications.length >= 0) {
      const transformedSent = sentNotifications.map(transformNotification);
      
      setNotifications(prev => ({
        ...prev,
        Sent: transformedSent
      }));
    }
  }, [sentNotifications]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOtherNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch and deduplicate Global Notifications
        const globalRes = await axios.get('http://127.0.0.1:8000/api/notifications/global/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const dedupGlobal = deduplicateNotifications(globalRes.data.results);

        // Fetch and deduplicate Following Notifications
        const followingRes = await axios.get('http://127.0.0.1:8000/api/notifications/followers/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const dedupFollowing = deduplicateNotifications(followingRes.data.results);

        // Fetch Personal Notifications
        const personalRes = await axios.get('http://127.0.0.1:8000/api/notifications/personal/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setNotifications(prev => ({
          ...prev,
          Global: dedupGlobal.map(transformNotification),
          Following: dedupFollowing.map(transformNotification),
          Personal: personalRes.data.results.map(transformNotification)
        }));
      } catch (err) {
        setError('Failed to fetch notifications');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOtherNotifications();
  }, [isOpen, accessToken]);

  const transformNotification = (notification) => {
    return {
      id: notification.id,
      type: notification.notification_type,
      user: notification.sender.username,
      message: notification.message,
      time: formatTime(notification.created_at),
      avatar: notification.sender.profile_picture,
      url: notification.url,
      isRead: notification.is_read,
      recipientCount: notification.recipient_count
    };
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'global': return '🌍';
      case 'personal': return '👤';
      case 'sent': return '✉️';
      case 'followers': return '👥';
      default: return '🔔';
    }
  };

  // Combine loading states
  const isLoading = loading || sentLoading;
  const hasError = error || sentError;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      
      {/* Main container with fixed height and flex column layout */}
      <div className="absolute right-0 top-full mt-2 w-[480px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col" style={{ height: '600px' }}>
        
        {/* Header - fixed height */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-yellow-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs - fixed height */}
        <div className="flex bg-gray-50 border-b border-gray-200 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-4 text-sm font-medium transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'text-white bg-gradient-to-r from-red-600 to-red-700 shadow-md'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <span className="text-base">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scrollable content area - takes remaining space */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notifications...</p>
            </div>
          ) : hasError ? (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <div className="text-4xl mb-3">⚠️</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Error loading notifications</h4>
              <p className="text-gray-500 text-sm">{hasError}</p>
              {activeTab === 'Sent' && (
                <button 
                  onClick={() => fetchNotifications()}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          ) : notifications[activeTab]?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notifications[activeTab].map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 ${!notification.isRead ? 'bg-red-50' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={notification.avatar}
                        alt={notification.user}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                        <span className="text-xs">{getNotificationIcon(notification.type)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm mb-1">
                        <span className="font-semibold text-gray-900">{notification.user}</span>
                        <span className="text-gray-600 ml-1">{notification.message}</span>
                      </div>
                      {notification.url && (
                        <a 
                          href={notification.url} 
                          className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {notification.url}
                        </a>
                      )}
                      {notification.recipientCount > 0 && activeTab === 'Sent' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Sent to {notification.recipientCount} {notification.recipientCount === 1 ? 'person' : 'people'}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <div className="text-4xl mb-3">
                {activeTab === 'Sent' ? '📤' : '🔔'}
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'Sent' ? 'No sent notifications' : 'No notifications yet'}
              </h4>
              <p className="text-gray-500 text-sm">
                {activeTab === 'Sent' 
                  ? 'Notifications you send will appear here.' 
                  : 'When you get notifications, they\'ll show up here.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer - fixed height */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <button 
            className="w-full text-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors cursor-pointer" 
            onClick={() => navigate('/notifications/send')}
          >
            Make a notification
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;