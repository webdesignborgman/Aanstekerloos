"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BarChart } from "lucide-react";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import PushManager from "@/components/push/PushManager";

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

        {/* Push functionaliteit verwijderd van dashboard */}

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