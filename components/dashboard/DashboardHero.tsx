// components/dashboard/DashboardHero.tsx
"use client";

import { Button } from "@/components/ui/button";
import { SmokeNowModal } from "@/components/smoke/SmokeNowModal";
import Link from "next/link";

export function DashboardHero() {
  return (
    <section className="bg-gradient-to-br from-orange-100 via-white to-amber-100 rounded-xl shadow p-6 mb-8 flex flex-col items-center text-center gap-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-900">Welkom terug!</h2>
      <p className="text-base text-gray-700 max-w-xl">
        Houd eenvoudig je rookgedrag bij en werk aan een rookvrije toekomst. Log direct een sigaret of zet de eerste stap naar stoppen!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
        <SmokeNowModal />
        <Button asChild variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
          <Link href="/dashboard/stoppen">Ik stop nu!</Link>
        </Button>
      </div>
    </section>
  );
}
