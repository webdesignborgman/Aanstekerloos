// /components/smoke/SmokeHeatmapDesktop.tsx
"use client";

import React from "react";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { SmokeLog } from "@/types/smokeLog";
import { smokeLogConverter } from "@/lib/converters/smokeLogConverter";
import { Card } from "@/components/ui/card";

// 0 t/m 23 uur
const HOURS = Array.from({ length: 24 }, (_, i) => i);
// Dagen in volgorde, NL labels
const DAYS = [
  { key: 1, label: "ma" },
  { key: 2, label: "di" },
  { key: 3, label: "wo" },
  { key: 4, label: "do" },
  { key: 5, label: "vr" },
  { key: 6, label: "za" },
  { key: 0, label: "zo" }, // zondag = 0 in JS
];

export function SmokeHeatmapDesktop() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SmokeLog[]>([]);

  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, `users/${user.uid}/smokeLogs`).withConverter(smokeLogConverter);
    const q = query(colRef);
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((doc) => doc.data()));
    });
    return () => unsub();
  }, [user]);

  if (!user) return null;

  // Heatmapdata: [day][hour] = aantal keer gerookt
  const heat: Record<number, Record<number, number>> = {};
  for (const day of DAYS.map((d) => d.key)) {
    heat[day] = {};
    for (const hour of HOURS) heat[day][hour] = 0;
  }
  for (const log of logs) {
    const day = log.timestamp.getDay();
    const hour = log.timestamp.getHours();
    if (typeof heat[day]?.[hour] === "number") {
      heat[day][hour]++;
    }
  }

  // Voor kleurgradatie
  const allCounts = Object.values(heat).flatMap((row) => Object.values(row));
  const max = Math.max(1, ...allCounts);

  function getCellStyle(count: number) {
    const intensity = count === 0 ? 0 : count / max;
    return {
      background: count
        ? `linear-gradient(0deg, #ff9800${Math.round(80 + intensity * 120).toString(16)}, #ffc107${Math.round(80 + intensity * 120).toString(16)})`
        : "#f3f4f6",
      color: intensity > 0.6 ? "#fff" : "#262626",
      opacity: intensity === 0 ? 0.15 : 1,
      width: 24,
      minWidth: 18,
      height: 20,
      fontSize: "11px",
      fontWeight: 500,
      borderRadius: 4,
      transition: "background 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  }

  return (
    <Card className="inline-block mx-auto shadow">
      <div className="p-4">
        <div className="mb-2 font-semibold">Jouw rookpatroon per week</div>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[38px_repeat(24,24px)] gap-[2px]">
            {/* Head row: uren */}
            <div />
            {HOURS.map((hour) => (
              <div key={hour} className="text-[10px] font-mono text-center" style={{ width: 24 }}>
                {hour.toString().padStart(2, "0")}
              </div>
            ))}
            {/* Dagen als rijen */}
            {DAYS.map((d) => (
              <React.Fragment key={d.key}>
                <div className="text-xs font-semibold text-right pr-1" style={{ height: 20, lineHeight: "20px" }}>
                  {d.label}
                </div>
                {HOURS.map((hour) => {
                  const count = heat[d.key][hour];
                  return (
                    <div
                      key={`cell-${d.key}-${hour}`}
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
      </div>
    </Card>
  );
}
