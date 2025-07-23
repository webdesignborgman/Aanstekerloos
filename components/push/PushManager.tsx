"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { urlBase64ToUint8Array } from "@/lib/push"; // helper om VAPID public key te decoderen

export default function PushManager() {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Registreer de service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("📡 SW registered:", reg.scope))
        .catch((err) => console.error("❌ SW registratie mislukte:", err));
    }
  }, []);

  useEffect(() => {
    // Check of er al een actieve push subscription is
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then(async (reg) => {
        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) {
          setIsSubscribed(true);
        }
      });
    }
  }, []);

  const handleSubscribe = async () => {
    const perm = await Notification.requestPermission();
    console.log("Permissie:", perm);
    setPermission(perm);
    if (perm !== "granted") return;

    if (!user) {
      alert("Je moet ingelogd zijn om push te activeren.");
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    console.log("💾 Subscription object:", sub.toJSON());

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
        <button onClick={handleSendTest} className="btn">
          🚀 Verstuur test-push notificatie
        </button>
      )}

      {permission === "denied" && <p>❌ Permissie geweigerd</p>}
    </div>
  );
}
