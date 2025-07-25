"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { urlBase64ToUint8Array } from "@/lib/push"; // helper om VAPID public key te decoderen

export default function PushManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn("Push notifications worden niet ondersteund in deze browser.");
      return;
    }

    // Stel de initiële permissie status in
    setPermission(Notification.permission);

    // Registreer de service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("📡 SW geregistreerd:", reg.scope);
        // Nadat de SW klaar is, controleer op een bestaand abonnement
        reg.pushManager.getSubscription().then((existingSub) => {
          if (existingSub) {
            console.log("👍 Bestaand abonnement gevonden");
            setIsSubscribed(true);
            setCurrentEndpoint(existingSub.endpoint);
          } else {
            console.log("👎 Geen bestaand abonnement gevonden");
            setIsSubscribed(false);
            setCurrentEndpoint(null);
          }
        });
      })
      .catch((err) => console.error("❌ SW registratie mislukt:", err));
  }, []); // Lege dependency array zorgt ervoor dat dit eenmaal wordt uitgevoerd

  const handleSubscribe = async () => {
    console.log("🚀 handleSubscribe aangeroepen");
    if (!user) {
      alert("Je moet ingelogd zijn om push te activeren.");
      console.log("❌ Abonnement gestopt: geen gebruiker.");
      return;
    }

    try {
      console.log("⏳ Service worker wordt opgehaald...");
      const reg = await navigator.serviceWorker.ready;
      console.log("✅ Service worker klaar:", reg);
      
      const existingSub = await reg.pushManager.getSubscription();
      console.log("🔍 Checking existing subscription:", existingSub);

      // Als er al een abonnement bestaat, gebruik het dan in plaats van een nieuw aan te maken.
      if (existingSub) {
        console.log("✅ Bestaand abonnement gevonden:", existingSub.endpoint);
        setIsSubscribed(true);
        setCurrentEndpoint(existingSub.endpoint);
        
        // Ook doorsturen naar backend als het nog niet bestaat
        const platform = getPlatformString();
        const createdAt = new Date().toISOString();
        try {
          const res = await fetch("/api/web-push/subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription: existingSub.toJSON(), uid: user.uid, platform, createdAt }),
          });
          const json = await res.json();
          console.log("📤 Existing subscription sent to backend:", json);
        } catch (e) {
          console.error("❌ Failed to send existing subscription to backend:", e);
        }
        return;
      }

      console.log("📝 Notificatie permissie wordt gevraagd...");
      const perm = await Notification.requestPermission();
      console.log("🔔 Permissie resultaat:", perm);
      setPermission(perm);

      if (perm !== "granted") {
        console.log("❌ Abonnement gestopt: permissie niet verleend.");
        return;
      }

      console.log("🔑 VAPID key:", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? "✅ Aanwezig" : "❌ Ontbreekt");
      
      console.log("📡 Push subscription wordt aangemaakt...");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      console.log("💾 Abonnement succesvol aangemaakt:", sub.toJSON());
      setCurrentEndpoint(sub.endpoint);

      // Bepaal platform info
      const platform = getPlatformString();
      const createdAt = new Date().toISOString();

      console.log("📤 Versturen naar backend...");
      const res = await fetch("/api/web-push/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), uid: user.uid, platform, createdAt }),
      });
      
      if (!res.ok) {
        throw new Error(`Backend error: ${res.status} ${res.statusText}`);
      }
      
      const json = await res.json();
      console.log("✅ Backend subscribe response:", json, res.status);
      setIsSubscribed(true);
    } catch (error) {
      console.error("❌ Error in handleSubscribe:", error);
      alert(`Er is een fout opgetreden: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Bepaal platform info
  function getPlatformString() {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return "Android";
    if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
    if (/Win/.test(ua)) return "Windows";
    if (/Mac/.test(ua)) return "MacOS";
    if (/Linux/.test(ua)) return "Linux";
    return "Onbekend";
  }



  const handleSendTest = async () => {
    if (!user) {
      alert("Je moet ingelogd zijn om een test push te sturen.");
      return;
    }
    const res = await fetch("/api/web-push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid }),
    });
    const json = await res.json();
    console.log("Backend send-push response:", json);
  };

  return (
    <div className="p-4 bg-gray-50 rounded space-y-2">
      <p>
        Push-permissie: <strong>{permission}</strong>
      </p>

      {permission === "default" && !isSubscribed && (
        <button 
          onClick={handleSubscribe} 
          onTouchStart={() => {}} // iOS Safari PWA fix
          style={{
            backgroundColor: '#0d9488',
            color: 'white',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            marginTop: '8px',
            WebkitTapHighlightColor: 'rgba(0,0,0,0.1)', // iOS tap feedback
            touchAction: 'manipulation' // Prevent double-tap zoom
          }}
        >
          Activeer Push Notifications
        </button>
      )}

      {permission === "granted" && !isSubscribed && (
        <button 
          onClick={handleSubscribe} 
          onTouchStart={() => {}} // iOS Safari PWA fix
          style={{
            backgroundColor: '#0d9488',
            color: 'white',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            marginTop: '8px',
            WebkitTapHighlightColor: 'rgba(0,0,0,0.1)', // iOS tap feedback
            touchAction: 'manipulation' // Prevent double-tap zoom
          }}
        >
          ✅ Abonneer voor Push Notifications
        </button>
      )}

      {isSubscribed && (
        <div className="space-y-2">
          <p className="text-green-700">✅ Je bent geabonneerd op push notificaties.</p>
          {currentEndpoint && (
            <p className="text-xs break-all">Endpoint: {currentEndpoint}</p>
          )}
          <button 
            type="button" 
            onClick={handleSendTest} 
            onTouchStart={() => {}} // iOS Safari PWA fix
            style={{
              backgroundColor: '#0d9488',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              marginTop: '8px',
              WebkitTapHighlightColor: 'rgba(0,0,0,0.1)', // iOS tap feedback
              touchAction: 'manipulation' // Prevent double-tap zoom
            }}
          >
            🚀 Verstuur test-push notificatie
          </button>
        </div>
      )}

      {permission === "denied" && <p>❌ Permissie geweigerd</p>}
    </div>
  );
}
