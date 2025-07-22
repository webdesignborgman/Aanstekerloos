self.addEventListener("install", () => {
    console.log("🔧 Service Worker installed");
    self.skipWaiting();
  });
  
  self.addEventListener("activate", () => {
    console.log("🚀 Service Worker activated");
  });
  
  self.addEventListener("push", (event) => {
    const data = event.data?.json() || { title: "Nieuw bericht", body: "Je hebt een melding!" };
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/icons/android-chrome-192x192.png",
      })
    );
  });
  