"use client";

import PushManager from "@/components/push/PushManager";
import { useEffect } from "react";
import { SmokeNowModal } from "@/components/smoke/SmokeNowModal";
import Link from "next/link";
import { BarChart } from "lucide-react";

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

        {/* Push Manager: abonnement + testknop */}
        <section className="mb-6">
          <PushManager />
        </section>

        {/* Snelle logging functionaliteit */}
        <section className="mb-6">
          <SmokeNowModal />
        </section>

        {/* Heatmap link naar rookpatroon */}
        <Link
          href="/dashboard/rookpatroon"
          className="inline-flex items-center gap-1 underline text-accent-600 hover:text-accent-700"
        >
          <BarChart className="h-4 w-4" />
          Rookpatroon‑inzicht
        </Link>
      </main>
  );
}