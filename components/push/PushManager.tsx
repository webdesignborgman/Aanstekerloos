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
    console.log("handleSubscribe aangeroepen");
    if (!user) {
      alert("Je moet ingelogd zijn om push te activeren.");
      console.log("Abonnement gestopt: geen gebruiker.");
      return;
    }

    // Probeer eerst uit te schrijven als er al een subscription is
    const reg = await navigator.serviceWorker.ready;
    const existingSub = await reg.pushManager.getSubscription();
    if (existingSub) {
      await existingSub.unsubscribe();
      console.log("👋 Oude abonnement verwijderd uit browser (voor nieuwe inschrijving)");
      await fetch("/api/web-push/subscription", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: existingSub.endpoint }),
      });
    }

    console.log("Notificatie permissie wordt gevraagd...");
    const perm = await Notification.requestPermission();
    console.log("Permissie resultaat:", perm);
    setPermission(perm);

    if (perm !== "granted") {
      console.log("Abonnement gestopt: permissie niet verleend.");
      return;
    }

    console.log("Wachten tot de service worker klaar is...");
    // const reg = await navigator.serviceWorker.ready; // al opgehaald
    console.log("Service worker is klaar.");

    console.log("Abonneren bij de push manager...");
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    console.log("💾 Abonnement succesvol:", sub.toJSON());
    setCurrentEndpoint(sub.endpoint);

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
    const platform = getPlatformString();
    const createdAt = new Date().toISOString();
    // Verstuur de subscription naar je backend, inclusief user id, platform en datum
    const res = await fetch("/api/web-push/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON(), uid: user.uid, platform, createdAt }),
    });
    let json = null;
    try {
      json = await res.json();
    } catch (e) {
      console.error("Kon geen geldige JSON parsen van backend:", e);
    }
    console.log("Backend subscribe response:", json, res.status);

    setIsSubscribed(true);
  };

  const handleUnsubscribe = async () => {
    console.log("handleUnsubscribe aangeroepen");
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();

    if (sub) {
      console.log("Unsubscribe endpoint:", sub.endpoint);
      await sub.unsubscribe();
      console.log("👋 Abonnement verwijderd uit browser");
      await fetch("/api/web-push/subscription", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      setCurrentEndpoint(null);
    }

    setIsSubscribed(false);
  };

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
        <button onClick={handleSubscribe} className="btn">
          Activeer Push Notifications
        </button>
      )}

      {permission === "granted" && !isSubscribed && (
        <button onClick={handleSubscribe} className="btn">
          ✅ Abonneer voor Push Notifications
        </button>
      )}

      {isSubscribed && (
        <div className="space-y-2">
          <p className="text-green-700">✅ Je bent geabonneerd op push notificaties.</p>
          {currentEndpoint && (
            <p className="text-xs break-all">Endpoint: {currentEndpoint}</p>
          )}
          <button onClick={handleSendTest} className="btn">
            🚀 Verstuur test-push notificatie
          </button>
          <button onClick={handleUnsubscribe} className="btn btn-secondary">
            Uitschrijven
          </button>
        </div>
      )}

      {permission === "denied" && <p>❌ Permissie geweigerd</p>}
    </div>
  );
}
