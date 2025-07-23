// app/dashboard/rookpatroon/page.tsx
"use client";

import { useEffect, useState } from "react";
import { SmokeHeatmapResponsive } from "@/components/smoke/SmokeHeatmapResponsive";
import { SmokeWeekBarChart } from "@/components/smoke/SmokeWeekBarChart";
import { SmokeLogList } from "@/components/smoke/SmokeLogList";
import { SmokeLog } from "@/types/smokeLog";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { smokeLogConverter } from "@/lib/converters/smokeLogConverter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";

export default function RookpatroonPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SmokeLog[]>([]);

  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, `users/${user.uid}/smokeLogs`).withConverter(smokeLogConverter);
    const unsub = onSnapshot(query(colRef), snapshot => {
      setLogs(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsub();
  }, [user]);

  return (
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

        <div className="max-w-fit md:min-w-[614px] mx-auto">
          <SmokeHeatmapResponsive logs={logs} />

          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Aantal per dag deze week</h2>
            <SmokeWeekBarChart logs={logs} />
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Jouw rooklogboek</h2>
            <SmokeLogList logs={logs} />
          </section>
        </div>
      </main>
  );
}