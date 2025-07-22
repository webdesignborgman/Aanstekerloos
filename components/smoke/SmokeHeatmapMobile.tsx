// /components/smoke/SmokeHeatmapMobile.tsx
"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";
import { SmokeLog } from "@/types/smokeLog";
import { smokeLogConverter } from "@/lib/converters/smokeLogConverter";
import { startOfWeek, addWeeks, format, subWeeks } from "date-fns";

const DAYS = ["M", "D", "W", "D", "V", "Z", "Z"]; // Ma, Di, Wo, etc.

export function SmokeHeatmapMobile() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SmokeLog[]>([]);
  const [weeks, setWeeks] = useState<Date[]>([]);

  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, `users/${user.uid}/smokeLogs`).withConverter(smokeLogConverter);
    const unsub = onSnapshot(colRef, (snap) => {
      setLogs(snap.docs.map((doc) => doc.data()));
    });
    return () => unsub();
  }, [user]);

  // Laatste 12 weken bepalen
  useEffect(() => {
    const now = new Date();
    const start = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 11);
    const allWeeks: Date[] = [];
    for (let i = 0; i < 12; i++) {
      allWeeks.push(addWeeks(start, i));
    }
    setWeeks(allWeeks);
  }, []);

  // Matrix bouwen: rows = weken, cols = dagen
  const matrix: number[][] = weeks.map((weekStart) =>
    Array.from({ length: 7 }, (_, dayIdx) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + dayIdx);
      const count = logs.filter(
        (log) =>
          format(log.timestamp, "yyyy-MM-dd") === format(dayDate, "yyyy-MM-dd")
      ).length;
      return count;
    })
  );

  // Max voor kleur
  const allCounts = matrix.flat();
  const max = Math.max(1, ...allCounts);

  function getBlockColor(count: number) {
    if (count === 0) return "bg-gray-200";
    if (count / max > 0.7) return "bg-accent-500";
    if (count / max > 0.4) return "bg-accent-400";
    if (count / max > 0.2) return "bg-accent-300";
    return "bg-accent-200";
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex flex-row gap-[2px]">
        {DAYS.map((day, dayIdx) => (
          <div key={dayIdx} className="flex flex-col gap-[2px]">
            {/* Week-rijen */}
            {matrix.map((week, weekIdx) => (
              <div
                key={weekIdx}
                className={`w-4 h-4 rounded ${getBlockColor(week[dayIdx])}`}
                title={`${week[dayIdx]} op ${day}`}
              ></div>
            ))}
            {/* Dag label onderaan */}
            <div className="text-[10px] text-center mt-1">{day}</div>
          </div>
        ))}
      </div>
      {/* Legenda */}
      <div className="flex gap-1 items-center mt-2 text-xs">
        <span>Weinig</span>
        <div className="w-4 h-4 rounded bg-accent-200"></div>
        <div className="w-4 h-4 rounded bg-accent-300"></div>
        <div className="w-4 h-4 rounded bg-accent-400"></div>
        <div className="w-4 h-4 rounded bg-accent-500"></div>
        <span>Veel</span>
      </div>
    </div>
  );
}
