"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { urlBase64ToUint8Array } from "@/lib/push";

function isIOS(): boolean {
  return /iP(hone|od|ad)/i.test(navigator.userAgent);
}

function shouldRequireStandalone(): boolean {
  if (!isIOS()) return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return false;
  const navWithStandalone = navigator as Navigator & { standalone?: boolean };
  return !(navWithStandalone.standalone === true);
}

export default function PushManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      console.warn("Push notifications worden niet ondersteund in deze browser.");
      return;
    }

    setPermission(Notification.permission);

    navigator.serviceWorker
      .register("/custom-sw.js")
      .then((reg) => {
        reg.pushManager.getSubscription().then((existingSub) => {
          if (existingSub) {
            setIsSubscribed(true);
            setCurrentEndpoint(existingSub.endpoint);
          } else {
            setIsSubscribed(false);
            setCurrentEndpoint(null);
          }
        });
      })
      .catch((err) => console.error("❌ SW registratie mislukt:", err));
  }, []);

  const handleSubscribe = async () => {
    if (!user) {
      alert("Je moet ingelogd zijn om push te activeren.");
      return;
    }

    if (shouldRequireStandalone()) {
      alert(
        "Op iOS moet je de app eerst op je beginscherm plaatsen (deelknop → 'Zet op beginscherm') om pushmeldingen te kunnen activeren."
      );
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const existingSub = await reg.pushManager.getSubscription();

      // Als er al een subscription bestaat, stuur hem gewoon op naar de backend
      if (existingSub) {
        await fetch("/api/web-push/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: existingSub.toJSON(),
            uid: user.uid,
            platform: getPlatformString(),
            createdAt: new Date().toISOString(),
          }),
        });
        setIsSubscribed(true);
        setCurrentEndpoint(existingSub.endpoint);
        return;
      }

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;

      const vapidKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      );
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      setCurrentEndpoint(sub.endpoint);

      await fetch("/api/web-push/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          uid: user.uid,
          platform: getPlatformString(),
          createdAt: new Date().toISOString(),
        }),
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error("❌ Error in handleSubscribe:", error);
    }
  };

  const handleSendTest = async () => {
    if (!user) return;

    try {
      const res = await fetch("/api/web-push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });
      const json = await res.json();
      if (json.success > 0) {
        alert(`✅ ${json.success} notificatie(s) verzonden!`);
      } else {
        alert("❌ Geen notificaties verzonden.");
      }
    } catch (error) {
      console.error("❌ Error sending test push:", error);
    }
  };

  function getPlatformString(): string {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return "Android";
    if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
    if (/Win/.test(ua)) return "Windows";
    if (/Mac/.test(ua)) return "MacOS";
    if (/Linux/.test(ua)) return "Linux";
    return "Onbekend";
  }

  return (
    <div className="mt-4 space-y-4">
      <div>Push‑permissie: {permission}</div>

      {permission === "default" && !isSubscribed && (
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleSubscribe}
        >
          Activeer Push Notifications
        </button>
      )}

      {permission === "granted" && !isSubscribed && (
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={handleSubscribe}
        >
          ✅ Abonneer voor Push Notifications
        </button>
      )}

      {isSubscribed && (
        <div className="space-y-2">
          <div className="text-green-600">✅ Je bent geabonneerd op push notificaties.</div>
          {currentEndpoint && (
            <div className="break-all text-sm text-gray-600">
              Endpoint: {currentEndpoint}
            </div>
          )}
          <button
            className="px-4 py-2 bg-teal-500 text-white rounded"
            onClick={handleSendTest}
          >
            🚀 Verstuur test-push notificatie
          </button>
        </div>
      )}

      {permission === "denied" && (
        <div className="text-red-600">❌ Permissie geweigerd</div>
      )}
    </div>
  );
}
