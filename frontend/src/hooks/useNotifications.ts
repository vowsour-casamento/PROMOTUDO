import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Notification } from '@/types';
import { useAuthStore } from '@/store/authStore';

export const useNotifications = () => {
  const { user, token } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: notifications = [], refetch } = useQuery<Notification[]>(
    ['notifications', user?.id],
    async () => {
      if (!user?.id || !token) return [];
      
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      return response.json();
    },
    {
      enabled: !!user?.id && !!token,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const markAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      refetch();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;

    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      refetch();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!token) return;

    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      refetch();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  };
};
