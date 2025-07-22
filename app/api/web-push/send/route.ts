// app/api/web-push/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getSubscription } from "../storage";

webpush.setVapidDetails(
  "mailto:your@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST() {
  const sub = getSubscription();
  if (!sub) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 });
  }

  try {
    await webpush.sendNotification(sub, JSON.stringify({ title: "Testmelding", body: "Je push-notificatie werkt!" }));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Push error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
