import { useEffect, useState } from 'react';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';

export default function PatientNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    // Poll for notification updates every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications/my');
      setNotifications(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load notifications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      // Update local state immediately
      const updatedNotifications = notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      setNotifications(updatedNotifications);
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/my/read-all');
      const updatedNotifications = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updatedNotifications);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
      console.error(error);
    }
  };

  if (loading) return <LoadingSpinner />;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
            <p className="text-sm text-slate-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2.5 bg-sky-500/10 text-sky-600 rounded-lg font-semibold hover:bg-sky-500/20 transition-all"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border-l-4 transition-all ${
                  notification.isRead
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-sky-50 border-sky-400 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`mt-1 flex-shrink-0 ${
                      notification.isRead ? 'text-slate-400' : 'text-sky-500'
                    }`}
                  >
                    <BellIcon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className={`font-semibold ${
                            notification.isRead
                              ? 'text-slate-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {notification.title || notification.message}
                        </p>
                        {notification.description && (
                          <p className="text-slate-600 text-sm mt-1">
                            {notification.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>

                      {/* Read Status */}
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex-shrink-0 px-3 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-semibold hover:bg-sky-600 transition-all flex items-center gap-1"
                        >
                          <CheckIcon className="w-4 h-4" />
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <BellIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-2">
                You'll be notified when your cases are reviewed
              </p>
            </div>
          )}
        </div>
      </div>
  );
}
