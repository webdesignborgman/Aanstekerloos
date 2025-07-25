// app/api/web-push/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { adminDb } from "../firebase-admin";

// Debug environment variables
console.log("🔍 VAPID Environment Check:");
console.log("- PUBLIC_KEY aanwezig:", !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
console.log("- PRIVATE_KEY aanwezig:", !!process.env.VAPID_PRIVATE_KEY);
console.log("- PUBLIC_KEY length:", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.length);

if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error("VAPID keys zijn niet geconfigureerd in environment variables");
}

webpush.setVapidDetails(
  "mailto:alex.borgman@gmail.com", // Gebruik je echte email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  console.log("📨 Push notification request ontvangen");
  
  let uid: string | undefined;
  try {
    const body = await req.json();
    uid = body.uid;
    console.log("👤 User ID:", uid);
  } catch {
    console.log("❌ Geen geldige JSON body");
    return NextResponse.json({ error: "Ongeldige request body" }, { status: 400 });
  }
  
  if (!uid) {
    console.log("❌ Geen uid gevonden");
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }
  
  // Haal alle subscriptions op voor deze user
  console.log("🔍 Ophalen subscriptions voor user:", uid);
  const subsSnap = await adminDb.collection("users").doc(uid).collection("subscriptions").get();
  const subs = subsSnap.docs.map(doc => doc.data());
  console.log("📋 Gevonden subscriptions:", subs.length);
  
  if (!subs.length) {
    console.log("❌ Geen subscriptions gevonden");
    return NextResponse.json({ error: "No subscriptions found for user" }, { status: 400 });
  }
  let success = 0, fail = 0;
  for (const sub of subs) {
    // Check minimaal op endpoint en keys
    if (!sub.endpoint || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
      console.log("Invalid subscription format:", sub);
      fail++;
      continue;
    }
    try {
      const payload = JSON.stringify({ 
        title: "Aanstekerloos", 
        body: "Je push-notificatie werkt!" 
      });
      
      const options = {
        TTL: 3600, // Time to live in seconds (1 hour)
        headers: {
          'Urgency': 'normal'
        }
      };
      
      console.log("Sending push to:", sub.endpoint.substring(0, 50) + "...");
      await webpush.sendNotification(sub as webpush.PushSubscription, payload, options);
      console.log("Push sent successfully to:", sub.endpoint.substring(0, 50) + "...");
      success++;
    } catch (err) {
      console.error("Push error for endpoint:", sub.endpoint.substring(0, 50) + "...", err);
      fail++;
    }
  }
  return NextResponse.json({ success, fail });
}
