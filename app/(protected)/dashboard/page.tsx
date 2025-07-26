"use client";

import { useEffect } from "react";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import OnboardingIntroCard from "@/components/onboarding/OnboardingIntroCard";

export default function DashboardPage() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("📡 SW registered:", reg.scope);
        })
        .catch((err) => console.error("❌ SW registratie mislukte:", err));
    }
  }, []);

  return (
      <main className="max-w-xl mx-auto px-2 pb-12">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        {/* Hero section met call-to-actions */}
        <DashboardHero />

        <OnboardingIntroCard />
      </main>
  );
}