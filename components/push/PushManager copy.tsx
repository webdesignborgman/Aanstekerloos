"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { urlBase64ToUint8Array } from "@/lib/push";

/**
 * Detecteer of de huidige gebruiker op een iOS-device zit.
 */
function isIOS(): boolean {
  return /iP(hone|od|ad)/i.test(navigator.userAgent);
}

/**
 * Controleer of op iOS de app nog geïnstalleerd moet worden.
 * Op andere platformen is 'standalone' niet verplicht.
 */
function shouldRequireStandalone(): boolean {
  if (!isIOS()) {
    // Niet iOS → geen standalone vereist
    return false;
  }

  // Test display-mode voor moderne browsers (iOS 16+).
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return false;
  }

  // Fallback voor oudere iOS-browsers: navigator.standalone kan bestaan.
  const navWithStandalone = navigator as Navigator & { standalone?: boolean };
  return !(navWithStandalone.standalone === true);
}

export default function PushManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);

  // Authentication-context uit je project
  const { user } = useAuth();

  useEffect(() => {
    // Controleer of serviceworkers en Push API ondersteund worden
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      console.warn("Push notifications worden niet ondersteund in deze browser.");
      return;
    }

    // Bewaar huidige permissiestatus
    setPermission(Notification.permission);

    // Registreer de serviceworker
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // SW geregistreerd: reg.scope
        // Controleer op bestaande subscription
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

  /**
   * Activeer pushnotificaties (abonneer) met respect voor platform-specifieke regels.
   */
  const handleSubscribe = async () => {
    if (!user) {
      alert("Je moet ingelogd zijn om push te activeren.");
      return;
    }

    // iOS: verplicht installeren op beginscherm
    if (shouldRequireStandalone()) {
      alert(
        "Op iOS moet je de app eerst op je beginscherm plaatsen (deelknop → 'Zet op beginscherm') om pushmeldingen te kunnen activeren."
      );
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;

      // Check op bestaande abonnement
      const existingSub = await reg.pushManager.getSubscription();

      // Verwijder oude Firebase Cloud Messaging (FCM) subscriptions
      if (existingSub && existingSub.endpoint.includes("fcm.googleapis.com")) {
        await existingSub.unsubscribe();
      }

      // Als er nog een geldige subscription bestaat, stuur hem naar de backend
      if (existingSub && !existingSub.endpoint.includes("fcm.googleapis.com")) {
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

      // Vraag toestemming
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
      // ❌ Abonnement gestopt: permissie niet verleend.
        return;
      }

      // Maak een nieuwe subscription aan met VAPID key
      const vapidKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      );
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      setCurrentEndpoint(sub.endpoint);

      // Stuur de subscription naar de backend
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

  /**
   * Verstuur een test push notificatie via de backend.
   */
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

  /**
   * Bepaal een simpele platform-string (alleen voor logging/analyse).
   */
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
    <div className="p-4 bg-gray-50 rounded space-y-2">
      <p>
        Push-permissie: <strong>{permission}</strong>
      </p>

      {/* Knop voor initiële toestemmingsaanvraag */}
      {permission === "default" && !isSubscribed && (
        <button
          onClick={handleSubscribe}
          style={{
            backgroundColor: "#0d9488",
            color: "white",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            width: "100%",
          }}
        >
          Activeer Push Notifications
        </button>
      )}

      {/* Knop om te abonneren nadat toestemming is gegeven */}
      {permission === "granted" && !isSubscribed && (
        <button
          onClick={handleSubscribe}
          style={{
            backgroundColor: "#0d9488",
            color: "white",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            width: "100%",
          }}
        >
          ✅ Abonneer voor Push Notifications
        </button>
      )}

      {/* UI voor wanneer er al een subscription is */}
      {isSubscribed && (
        <div className="space-y-2">
          <p className="text-green-700">
            ✅ Je bent geabonneerd op push notificaties.
          </p>
          {currentEndpoint && (
            <p className="text-xs break-all">Endpoint: {currentEndpoint}</p>
          )}
          <button
            onClick={handleSendTest}
            style={{
              backgroundColor: "#0d9488",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              width: "100%",
            }}
          >
            🚀 Verstuur test-push notificatie
          </button>
        </div>
      )}

      {/* Permissie geweigerd */}
      {permission === "denied" && <p>❌ Permissie geweigerd</p>}
    </div>
  );
}
