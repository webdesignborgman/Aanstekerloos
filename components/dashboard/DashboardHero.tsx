// components/dashboard/DashboardHero.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { SmokeNowModal } from "@/components/smoke/SmokeNowModal";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { AIAnalyseButton } from "../smoke/AIAnalyseButton";

export function DashboardHero() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = React.useState(false);

  async function handleStopNow() {
    if (!user) return;
    setSaving(true);
    await setDoc(
      doc(db, "users", user.uid, "onboarding", "stopdatum"),
      {
        realStopDate: new Date(),
        createdAt: new Date()
      },
      { merge: true }
    );
    setSaving(false);
    router.push("/dashboard");
  }

  return (
    <section className="bg-gradient-to-br from-orange-100 via-white to-amber-100 rounded-xl shadow p-6 mb-8 flex flex-col items-center text-center gap-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-900">Welkom terug!</h2>
      <p className="text-base text-gray-700 max-w-xl">
        Houd eenvoudig je rookgedrag bij en werk aan een rookvrije toekomst. Log direct een sigaret of zet de eerste stap naar stoppen!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
        <SmokeNowModal />
        <Button
          variant="outline"
          className="border-green-600 text-green-700 hover:bg-green-50"
          disabled={saving}
          onClick={handleStopNow}
        >
          {saving ? "Bezig..." : "Ik stop nu!"}
        </Button>
      </div>
      {/* Rookpatroon inzicht link gecentreerd onder de knoppen */}
      <div className="flex justify-center mt-4">
        <Link
          href="/dashboard/rookpatroon"
          className="inline-flex items-center gap-1 underline text-accent-600 hover:text-accent-700"
        >
          {/* BarChart icon importeren uit lucide-react */}
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" /><rect x="7" y="13" width="3" height="5" rx="1" /><rect x="12" y="8" width="3" height="10" rx="1" /><rect x="17" y="5" width="3" height="13" rx="1" /></svg>
          Rookpatroon‑inzicht
        </Link>
      </div>
      <h2 className="text-lg font-bold mt-8 mb-2">📊 Automatische Inzichten</h2>
      <AIAnalyseButton />
    </section>
  );
}
