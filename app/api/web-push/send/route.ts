// app/api/web-push/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { adminDb } from "../firebase-admin";

webpush.setVapidDetails(
  "mailto:your@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  // Haal de user-id op uit de body (of uit auth context als je dat toevoegt)
  // Voor nu: test met een hardcoded uid of stuur hem mee vanuit de frontend
  let uid: string | undefined;
  try {
    const body = await req.json();
    uid = body.uid;
  } catch {
    // geen body of geen json
  }
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }
  // Haal alle subscriptions op voor deze user
  const subsSnap = await adminDb.collection("users").doc(uid).collection("subscriptions").get();
  const subs = subsSnap.docs.map(doc => doc.data());
  if (!subs.length) {
    return NextResponse.json({ error: "No subscriptions found for user" }, { status: 400 });
  }
  let success = 0, fail = 0;
  for (const sub of subs) {
    // Check minimaal op endpoint en keys
    if (!sub.endpoint || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
      fail++;
      continue;
    }
    try {
      await webpush.sendNotification(sub as webpush.PushSubscription, JSON.stringify({ title: "Testmelding", body: "Je push-notificatie werkt!" }));
      success++;
    } catch (err) {
      console.error("Push error:", err);
      fail++;
    }
  }
  return NextResponse.json({ success, fail });
}
