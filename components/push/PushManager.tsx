"use client";

import { useEffect, useState } from 'react';
import { urlBase64ToUint8Array } from '@/lib/push';
import { useAuth } from '@/components/auth/AuthContext';

export default function PushManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const { user } = useAuth();

  // Helper om te detecteren of de app als PWA draait (o.a. voor iOS)
// Helper om te detecteren of de app als PWA draait (o.a. voor iOS)
function isStandalone(): boolean {
  // Controleer display mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Verruim het Navigator‑type met een optionele standalone‑property
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      console.warn('Push notifications worden niet ondersteund in deze browser.');
      return;
    }

    setPermission(Notification.permission);

    // Registreer de serviceworker
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('📡 SW geregistreerd:', reg.scope);
        reg.pushManager.getSubscription().then((existingSub) => {
          if (existingSub) {
            console.log('👍 Bestaand abonnement gevonden');
            setIsSubscribed(true);
            setCurrentEndpoint(existingSub.endpoint);
          } else {
            console.log('👎 Geen bestaand abonnement gevonden');
            setIsSubscribed(false);
            setCurrentEndpoint(null);
          }
        });
      })
      .catch((err) => console.error('❌ SW registratie mislukt:', err));
  }, []);

  const handleSubscribe = async () => {
    if (!user) {
      alert('Je moet ingelogd zijn om push te activeren.');
      return;
    }

    // Check of de app standalone draait (iOS)
    if (!isStandalone()) {
      alert('Installeer de app op het beginscherm (Add to Home Screen) om pushmeldingen te activeren.');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const existingSub = await reg.pushManager.getSubscription();

      if (existingSub && existingSub.endpoint.includes('fcm.googleapis.com')) {
        // Verwijder oude FCM-subscripties
        await existingSub.unsubscribe();
      }

      if (existingSub && !existingSub.endpoint.includes('fcm.googleapis.com')) {
        // Bestaand geldig abonnement doorsturen naar backend
        const res = await fetch('/api/web-push/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: existingSub.toJSON(),
            uid: user.uid,
            platform: getPlatformString(),
            createdAt: new Date().toISOString(),
          }),
        });
        await res.json();
        setIsSubscribed(true);
        setCurrentEndpoint(existingSub.endpoint);
        return;
      }

      // Vraag toestemming
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        console.log('❌ Abonnement gestopt: permissie niet verleend.');
        return;
      }

      // Nieuwe subscription aanmaken
      const vapidKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      setCurrentEndpoint(sub.endpoint);

      // Verstuur subscription naar backend
      const res = await fetch('/api/web-push/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          uid: user.uid,
          platform: getPlatformString(),
          createdAt: new Date().toISOString(),
        }),
      });
      await res.json();
      setIsSubscribed(true);
    } catch (error) {
      console.error('❌ Error in handleSubscribe:', error);
    }
  };

  const handleSendTest = async () => {
    if (!user) return;

    try {
      const res = await fetch('/api/web-push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      });
      const json = await res.json();
      if (json.success > 0) {
        alert(`✅ ${json.success} notificatie(s) verzonden!`);
      } else {
        alert('❌ Geen notificaties verzonden.');
      }
    } catch (error) {
      console.error('❌ Error sending test push:', error);
    }
  };

  function getPlatformString() {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
    if (/Win/.test(ua)) return 'Windows';
    if (/Mac/.test(ua)) return 'MacOS';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Onbekend';
  }

  return (
    <div className="p-4 bg-gray-50 rounded space-y-2">
      <p>Push-permissie: <strong>{permission}</strong></p>

      {permission === 'default' && !isSubscribed && (
        <button
          onClick={handleSubscribe}
          style={{
            backgroundColor: '#0d9488',
            color: 'white',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            width: '100%',
          }}
        >
          Activeer Push Notifications
        </button>
      )}

      {permission === 'granted' && !isSubscribed && (
        <button
          onClick={handleSubscribe}
          style={{
            backgroundColor: '#0d9488',
            color: 'white',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            width: '100%',
          }}
        >
          ✅ Abonneer voor Push Notifications
        </button>
      )}

      {isSubscribed && (
        <div className="space-y-2">
          <p className="text-green-700">✅ Je bent geabonneerd op push notificaties.</p>
          {currentEndpoint && <p className="text-xs break-all">Endpoint: {currentEndpoint}</p>}
          <button
            onClick={handleSendTest}
            style={{
              backgroundColor: '#0d9488',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              width: '100%',
            }}
          >
            🚀 Verstuur test-push notificatie
          </button>
        </div>
      )}

      {permission === 'denied' && <p>❌ Permissie geweigerd</p>}
    </div>
  );
}
