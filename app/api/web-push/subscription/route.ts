// app/api/web-push/subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setSubscription } from "../storage";

export async function POST(req: NextRequest) {
  const browserSub = await req.json();
  console.log("💾 Received subscription:", browserSub);

  const rawP256dh = browserSub.keys?.p256dh;
  const rawAuth = browserSub.keys?.auth;
  const endpoint = browserSub.endpoint;

  if (!rawP256dh || !rawAuth) {
    return NextResponse.json({ error: "Invalid keys" }, { status: 400 });
  }

  setSubscription({ endpoint, expirationTime: browserSub.expirationTime, keys: { p256dh: rawP256dh, auth: rawAuth } });
  return NextResponse.json({ success: true });
}

export async function GET() {
  const saved = require("../storage").getSubscription();
  console.log("🔍 GET subscription:", saved);
  return NextResponse.json(saved);
}
