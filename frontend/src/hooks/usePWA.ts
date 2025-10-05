'use client';

import { useEffect, useState } from 'react';

interface PWAInstallPrompt extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: PWAInstallPrompt;
  }
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if already installed
    if (typeof window !== 'undefined') {
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
      setIsOnline(navigator.onLine);
      
      // Check push notification support
      setPushSupported('serviceWorker' in navigator && 'PushManager' in window);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: PWAInstallPrompt) => {
      console.log('PWA: Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker - SOLO en producción
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW: Service Worker registered successfully:', registration);
          
          // Check for existing push subscription
          return registration.pushManager.getSubscription().then((subscription) => {
            if (subscription) {
              console.log('PWA: Existing push subscription found');
              setPushSubscribed(true);
              setPushSubscription(subscription);
            }
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              console.log('SW: Update found');
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('SW: New version available');
                    // TODO: Show update notification
                  }
                });
              }
            });
          });
        })
        .catch((error) => {
          console.error('SW: Service Worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('PWA: No install prompt available');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('PWA: User choice:', outcome);
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PWA: Install failed:', error);
      return false;
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const showNotification = async (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/logooo.png',
        badge: '/logooo.png',
        ...options
      });
    } else {
      new Notification(title, {
        icon: '/logooo.png',
        ...options
      });
    }
  };

  const subscribeToPush = async (): Promise<boolean> => {
    if (!pushSupported) {
      console.log('PWA: Push notifications not supported');
      return false;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('PWA: Notification permission denied');
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/push/vapid-public-key`);
      const { publicKey } = await response.json();

      if (!publicKey) {
        throw new Error('VAPID public key not available');
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      // Send subscription to backend
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;

      const subscribeResponse = await fetch(`${API_URL}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${parsedTokens?.accessToken}`
        },
        body: JSON.stringify({ subscription })
      });

      if (subscribeResponse.ok) {
        console.log('PWA: Successfully subscribed to push notifications');
        setPushSubscribed(true);
        setPushSubscription(subscription);
        return true;
      } else {
        throw new Error('Failed to save subscription to backend');
      }

    } catch (error) {
      console.error('PWA: Failed to subscribe to push notifications:', error);
      return false;
    }
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    try {
      if (pushSubscription) {
        // Unsubscribe from browser
        const success = await pushSubscription.unsubscribe();
        
        if (success) {
          // Remove from backend
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const token = localStorage.getItem('auth_tokens');
          const parsedTokens = token ? JSON.parse(token) : null;

          await fetch(`${API_URL}/api/push/unsubscribe`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${parsedTokens?.accessToken}`
            }
          });

          console.log('PWA: Successfully unsubscribed from push notifications');
          setPushSubscribed(false);
          setPushSubscription(null);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('PWA: Failed to unsubscribe from push notifications:', error);
      return false;
    }
  };

  const sendTestNotification = async (): Promise<boolean> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_tokens');
      const parsedTokens = token ? JSON.parse(token) : null;

      const response = await fetch(`${API_URL}/api/push/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${parsedTokens?.accessToken}`
        }
      });

      if (response.ok) {
        console.log('PWA: Test notification sent');
        return true;
      }
      return false;
    } catch (error) {
      console.error('PWA: Failed to send test notification:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    pushSupported,
    pushSubscribed,
    installApp,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
    showNotification,
    requestNotificationPermission
  };
}