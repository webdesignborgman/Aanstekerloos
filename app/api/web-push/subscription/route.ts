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

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json();
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint required" }, { status: 400 });
  }

  try {
    let deleted = false;
    const usersSnapshot = await adminDb.collection("users").get();
    for (const userDoc of usersSnapshot.docs) {
      const subsSnapshot = await adminDb.collection("users").doc(userDoc.id).collection("subscriptions").get();
      for (const subDoc of subsSnapshot.docs) {
        const data = subDoc.data();
        if (data.endpoint === endpoint) {
          await subDoc.ref.delete();
          console.log(`Subscription ${endpoint} deleted for user ${userDoc.id}`);
          deleted = true;
        }
      }
    }
    if (deleted) {
      return NextResponse.json({ success: true });
    } else {
      console.log(`Subscription ${endpoint} not found in any user.`);
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
