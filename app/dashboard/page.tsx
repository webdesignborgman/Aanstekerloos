// /app/dashboard/page.tsx

import { RequireAuth } from "@/components/auth/RequireAuth";
import { SmokeHeatmap } from "@/components/smoke/SmokeHeatmap";

import { SmokeNowModal } from "@/components/smoke/SmokeNowModal";
import Link from "next/link";
import { BarChart } from "lucide-react";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <main className="max-w-xl mx-auto px-2 pb-12">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        {/* Snelle logging */}
        <section className="mb-6">
          <SmokeNowModal />
        </section>
        {/* Heatmap */}
        <Link href="/dashboard/rookpatroon" className="inline-flex items-center gap-1 underline text-accent-600 hover:text-accent-700">
  <BarChart className="h-4 w-4" />
  Rookpatroon-inzicht
</Link>

      </main>
    </RequireAuth>
  );
}
