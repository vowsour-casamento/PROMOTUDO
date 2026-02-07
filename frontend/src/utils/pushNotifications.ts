interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushNotificationPayload {
  title: string;
  message: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  url?: string;
}

class PushNotificationManager {
  private subscription: PushSubscription | null = null;
  private isSupported = false;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.checkSupport();
  }

  private checkSupport() {
    this.isSupported = 'serviceWorker' in navigator && 
                     'PushManager' in window && 
                     'Notification' in window;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      
      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      });

      this.subscription = subscription;
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      await this.subscription.unsubscribe();
      this.subscription = null;
      
      // Remove from server
      await this.removeSubscriptionFromServer();
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  async showLocalNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.isSupported || this.permission !== 'granted') {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(payload.title, {
        body: payload.message,
        icon: payload.icon || '/logo192.png',
        badge: payload.badge || '/favicon.ico',
        tag: payload.tag,
        data: payload.data,
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'Ver',
            icon: '/logo192.png'
          },
          {
            action: 'dismiss',
            title: 'Dispensar',
            icon: '/favicon.ico'
          }
        ]
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const subscriptionData = subscription.toJSON() as PushSubscriptionData;
      
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(subscriptionData)
      });
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }

  isPushSupported(): boolean {
    return this.isSupported;
  }
}

export const pushNotificationManager = new PushNotificationManager();

// Hook para React
export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const checkStatus = async () => {
      if (!pushNotificationManager.isPushSupported()) {
        return;
      }

      setPermission(pushNotificationManager.getPermission());
      
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    };

    checkStatus();
  }, []);

  const subscribe = async () => {
    const hasPermission = await pushNotificationManager.requestPermission();
    if (!hasPermission) {
      return false;
    }

    const subscription = await pushNotificationManager.subscribeToPush();
    setIsSubscribed(!!subscription);
    return !!subscription;
  };

  const unsubscribe = async () => {
    const success = await pushNotificationManager.unsubscribeFromPush();
    setIsSubscribed(false);
    return success;
  };

  const showNotification = async (payload: PushNotificationPayload) => {
    await pushNotificationManager.showLocalNotification(payload);
  };

  return {
    isSubscribed,
    permission,
    isSupported: pushNotificationManager.isPushSupported(),
    subscribe,
    unsubscribe,
    showNotification
  };
};
