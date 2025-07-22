"use client";

import { useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/push"; // helper om VAPID public key te decoderen

export default function PushManager() {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Registreer de service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("📡 SW registered:", reg.scope))
        .catch((err) => console.error("❌ SW registratie mislukte:", err));
    }
  }, []);

  const handleSubscribe = async () => {
    const perm = await Notification.requestPermission();
    console.log("Permissie:", perm);
    setPermission(perm);
    if (perm !== "granted") return;

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    console.log("💾 Subscription object:", sub.toJSON());

    // Verstuur de subscription naar je backend
    const res = await fetch("/api/web-push/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
    const json = await res.json();
    console.log("Backend subscribe response:", json);

    setIsSubscribed(true);
  };

  const handleSendTest = async () => {
    const res = await fetch("/api/web-push/send", { method: "POST" });
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
