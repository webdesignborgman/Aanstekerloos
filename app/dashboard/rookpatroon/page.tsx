import { RequireAuth } from "@/components/auth/RequireAuth";
import { SmokeHeatmapResponsive } from "@/components/smoke/SmokeHeatmapResponsive";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SmokeLogList } from "@/components/smoke/SmokeLogList";

export default function RookpatroonPage() {
  return (
    <RequireAuth>
      <main className="w-full max-w-5xl mx-auto px-2 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Rookpatroon</h1>
        </div>
        <p className="mb-4 text-muted-foreground text-sm">
          Hier zie je op welke momenten van de week je het meest rookt. Handig om je gewoontes te ontdekken.
        </p>
        {/* Hier de responsive heatmap! */}
        <div className="max-w-fit md:min-w-[614px] mx-auto">
          <SmokeHeatmapResponsive />

          <section>
            <h2 className="text-lg font-semibold mb-2">Jouw rooklogboek</h2>
            <SmokeLogList />
          </section>
        </div>
      </main>
    </RequireAuth>
  );
}
