"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { SmokeLog } from "@/types/smokeLog";
import { smokeLogConverter } from "@/lib/converters/smokeLogConverter";
import { Card } from "@/components/ui/card";

// 0 t/m 23 uur
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = [
  { key: 1, label: "ma" },
  { key: 2, label: "di" },
  { key: 3, label: "wo" },
  { key: 4, label: "do" },
  { key: 5, label: "vr" },
  { key: 6, label: "za" },
  { key: 0, label: "zo" },
];

export function SmokeHeatmapResponsive() {
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

  // Blokjes-styling
  const mobileCell = {
    width: "18px",
    minWidth: "12px",
    height: "16px",
    fontSize: "9px",
    fontWeight: 500,
    borderRadius: "3px",
  };
  const desktopCell = {
    width: "24px",
    minWidth: "18px",
    height: "20px",
    fontSize: "11px",
    fontWeight: 500,
    borderRadius: "4px",
  };

  function getCellStyle(count: number, isDesktop: boolean) {
    const intensity = count === 0 ? 0 : count / max;
    return {
      background: count
        ? `linear-gradient(0deg, #22c55e${Math.round(80 + intensity * 120).toString(16)}, #86efac${Math.round(80 + intensity * 120).toString(16)})`
        : "#f3f4f6",
      color: intensity > 0.6 ? "#fff" : "#262626",
      opacity: intensity === 0 ? 0.12 : 1,
      transition: "background 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...(isDesktop ? desktopCell : mobileCell),
    };
  }

  // Min-width van de grid = label + (24 * blokje) + gap (label 24px/38px, blokje 18/24px)
  const gridMinWidthMobile = 24 + (24 * 18) + (23 * 1.5); // ~456px
  const gridMinWidthDesktop = 38 + (24 * 24) + (23 * 2);   // ~614px

  return (
    <div className="w-full flex justify-center">
      <Card
        className="w-full md:max-w-fit md:min-w-[614px] mx-auto shadow bg-gradient-to-b from-green-100 to-green-200 p-2 md:p-4"
      >
        <div className="mb-2 font-semibold text-sm md:text-base">
          Jouw rookpatroon per week
        </div>
        <div className="overflow-x-auto md:overflow-x-visible w-full">
          <div>
            {/* MOBILE GRID */}
            <div
              className="grid grid-cols-[24px_repeat(24,18px)] gap-[1.5px] md:hidden"
              style={{ minWidth: `${gridMinWidthMobile}px` }}
            >
              {/* Uur labels */}
              <div />
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="text-[8px] font-mono text-center"
                  style={{ width: 18 }}
                >
                  {hour.toString().padStart(2, "0")}
                </div>
              ))}
              {DAYS.map((d) => (
                <div key={d.key} className="contents">
                  <div
                    className="text-[10px] font-semibold text-right pr-1"
                    style={{ height: 16 }}
                  >
                    {d.label}
                  </div>
                  {HOURS.map((hour) => {
                    const count = heat[d.key][hour];
                    return (
                      <div
                        key={`cell-${d.key}-${hour}`}
                        style={getCellStyle(count, false)}
                        title={`${count}x op ${d.label}, ${hour}:00`}
                      >
                        {count > 0 ? count : ""}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {/* DESKTOP GRID */}
            <div
              className="hidden md:grid grid-cols-[38px_repeat(24,24px)] gap-[2px]"
              style={{ minWidth: `${gridMinWidthDesktop}px` }}
            >
              <div />
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="text-[10px] font-mono text-center"
                  style={{ width: 24 }}
                >
                  {hour.toString().padStart(2, "0")}
                </div>
              ))}
              {DAYS.map((d) => (
                <div key={d.key} className="contents">
                  <div
                    className="text-xs font-semibold text-right pr-1"
                    style={{ height: 20 }}
                  >
                    {d.label}
                  </div>
                  {HOURS.map((hour) => {
                    const count = heat[d.key][hour];
                    return (
                      <div
                        key={`cell-${d.key}-${hour}`}
                        style={getCellStyle(count, true)}
                        title={`${count}x op ${d.label}, ${hour}:00`}
                      >
                        {count > 0 ? count : ""}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Legenda */}
        <div className="flex gap-1 items-center mt-2 text-xs">
          <span>Weinig</span>
          <div className="w-4 h-4 rounded bg-green-100"></div>
          <div className="w-4 h-4 rounded bg-green-300"></div>
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>Veel</span>
        </div>
      </Card>
    </div>
  );
}
