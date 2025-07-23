// app/api/web-push/subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../firebase-admin";

export async function POST(req: NextRequest) {
  const { subscription, uid, platform, createdAt } = await req.json();
  if (!uid || !subscription) {
    return NextResponse.json({ error: "uid and subscription required" }, { status: 400 });
  }
  // Sla op in subcollectie 'subscriptions' bij de user, met platform en datum
  await adminDb
    .collection("users")
    .doc(uid)
    .collection("subscriptions")
    .doc(subscription.endpoint.replace(/[^a-zA-Z0-9]/g, "_"))
    .set({
      ...subscription,
      platform: platform || null,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    });
  return NextResponse.json({ success: true });
}
