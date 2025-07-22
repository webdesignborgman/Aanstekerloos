// /components/smoke/SmokeHeatmapHorizontal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { SmokeLog } from "@/types/smokeLog";
import { smokeLogConverter } from "@/lib/converters/smokeLogConverter"; // <== jouw converter importeren
import { Card } from "@/components/ui/card";

// Uren van de dag, 0 t/m 23. Wil je blokken van 3 uur? Gebruik [0,3,6,...,21]
const HOURS = Array.from({ length: 24 }, (_, i) => i);
// Dagen in volgorde, NL labels
const DAYS = [
  { key: 1, label: "ma" },
  { key: 2, label: "di" },
  { key: 3, label: "wo" },
  { key: 4, label: "do" },
  { key: 5, label: "vr" },
  { key: 6, label: "za" },
  { key: 0, label: "zo" }, // let op: JS Date zondag = 0
];

export function SmokeHeatmap() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SmokeLog[]>([]);

  useEffect(() => {
    if (!user) return;
    // Gebruik de converter hier!
    const colRef = collection(db, `users/${user.uid}/smokeLogs`).withConverter(smokeLogConverter);
    const unsub = onSnapshot(colRef, (snap) => {
      setLogs(snap.docs.map((doc) => doc.data()));
    });
    return () => unsub();
  }, [user]);

  if (!user) return null;

  // Heatmapdata: { [hour]: { [day]: aantal } }
  const heat: Record<number, Record<number, number>> = {};
  for (const hour of HOURS) {
    heat[hour] = {};
    for (const day of DAYS.map((d) => d.key)) heat[hour][day] = 0;
  }
  for (const log of logs) {
    const day = log.timestamp.getDay(); // 0=zo, 1=ma, etc.
    const hour = log.timestamp.getHours();
    if (typeof heat[hour]?.[day] === "number") {
      heat[hour][day]++;
    }
  }
  // Max voor kleurgradatie
  const allCounts = Object.values(heat).flatMap((d) => Object.values(d));
  const max = Math.max(1, ...allCounts);

  // Responsive blokjes
  function getCellStyle(count: number) {
    const intensity = count === 0 ? 0 : count / max;
    return {
      background: count
        ? `linear-gradient(0deg, #ff9800${Math.round(80 + intensity * 120).toString(16)}, #ffc107${Math.round(80 + intensity * 120).toString(16)})`
        : "#f3f4f6",
      color: intensity > 0.6 ? "#fff" : "#262626",
      opacity: intensity === 0 ? 0.15 : 1,
      width: 32,
      minWidth: 24,
      height: 26,
      fontSize: "12px",
      fontWeight: 500,
      borderRadius: 6,
      transition: "background 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  }

  return (
    <Card className="p-3 overflow-x-auto">
      <div className="mb-2 font-semibold">Jouw rookpatroon per week</div>
      <div className="inline-block">
        <div className="grid grid-cols-[38px_repeat(7,32px)] gap-[2px]">
          {/* Head row: dagen */}
          <div />
          {DAYS.map((d) => (
            <div
              key={d.key}
              className="text-xs font-semibold text-center"
              style={{ width: 32 }}
            >
              {d.label}
            </div>
          ))}
          {/* Rest: elke rij = uur, elke kolom = dag */}
          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              <div
                className="text-[11px] font-mono text-right pr-1"
                style={{ height: 24, lineHeight: "24px" }}
              >
                {hour.toString().padStart(2, "0")}:00
              </div>
              {DAYS.map((d) => {
                const count = heat[hour][d.key];
                return (
                  <div
                    key={`cell-${hour}-${d.key}`}
                    style={getCellStyle(count)}
                    title={`${count}x op ${d.label}, ${hour}:00`}
                  >
                    {count > 0 ? count : ""}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Card>
  );
}
