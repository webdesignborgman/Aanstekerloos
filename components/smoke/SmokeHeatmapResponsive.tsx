// components/smoke/SmokeHeatmapResponsive.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SmokeLog } from "@/types/smokeLog";
import { SmokeDayDetailModal } from "@/components/smoke/SmokeDayDetailModal";
import { addDays, startOfWeek, endOfWeek, isSameDay, format, addWeeks, subWeeks, isSameWeek } from "date-fns";

// Exporteer DAYS voor andere charts
export const DAYS = [
  { key: 1, label: "ma" },
  { key: 2, label: "di" },
  { key: 3, label: "wo" },
  { key: 4, label: "do" },
  { key: 5, label: "vr" },
  { key: 6, label: "za" },
  { key: 0, label: "zo" },
];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface Props {
  logs: SmokeLog[];
}

export function SmokeHeatmapResponsive({ logs }: Props) {
  // Weeknavigatie state
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // Dagmodal
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Filter logs in geselecteerde week
  const weekLogs = logs.filter(
    (l) => l.timestamp >= weekStart && l.timestamp <= weekEnd
  );

  // Heatmapdata: [day][hour] = aantal keer gerookt
  const heat: Record<number, Record<number, number>> = {};
  DAYS.forEach((d) => {
    heat[d.key] = {};
    HOURS.forEach((h) => (heat[d.key][h] = 0));
  });
  weekLogs.forEach((log) => {
    const d = log.timestamp.getDay();
    const h = log.timestamp.getHours();
    heat[d][h]++;
  });
  const allCounts = Object.values(heat).flatMap((r) => Object.values(r));
  const max = Math.max(1, ...allCounts);

  const getStyles = (count: number, isDesktop: boolean) => {
    const intensity = count / max;
    const light = 90 - 50 * intensity;
    return {
      backgroundColor: count ? `hsl(120,55%,${light}%)` : "#f3f4f6",
      color: intensity > 0.6 ? "#fff" : "#262626",
      width: isDesktop ? 24 : 18,
      height: isDesktop ? 20 : 16,
      borderRadius: isDesktop ? 4 : 3,
      fontSize: isDesktop ? 11 : 9,
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: isDesktop ? "0 2px" : "0 1px",
    };
  };

  const minWidthMobile = 24 + 24 * 18 + 23 * 2;
  const minWidthDesktop = 38 + 24 * 24 + 23 * 2;

  // Weeknavigatie knoppen
  const isCurrentWeek = isSameWeek(weekStart, new Date(), { weekStartsOn: 1 });

  return (
    <>
      <Card className="w-full shadow bg-gradient-to-b from-green-100 to-green-200 p-2 md:p-4 mx-auto">
        {/* Navigatie */}
        <div className="flex items-center justify-between mb-2">
          <button
            className="text-xs px-2 py-1 rounded bg-green-200 hover:bg-green-300"
            onClick={() => setWeekStart((w) => subWeeks(w, 1))}
          >
            ← Vorige week
          </button>
          <span className="font-semibold">
            {`Week van ${format(weekStart, "dd MMM")} t/m ${format(weekEnd, "dd MMM")}`}
          </span>
          <button
            className="text-xs px-2 py-1 rounded bg-green-200 hover:bg-green-300 disabled:opacity-50"
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            disabled={isCurrentWeek}
          >
            Volgende week →
          </button>
        </div>
        <div className="overflow-x-auto md:overflow-x-visible">
          <div className="inline-block">
            {/* Mobile */}
            <div className="grid grid-cols-[24px_repeat(24,18px)] gap-[1px] md:hidden" style={{ minWidth: minWidthMobile }}>
              <div />
              {HOURS.map((h) => (
                <div key={h} className="text-[8px] font-mono text-center" style={{ width: 18 }}>
                  {h.toString().padStart(2, "0")}
                </div>
              ))}
              {DAYS.map((d) => {
                const dayDate = addDays(weekStart, (d.key + 6) % 7);
                return (
                  <div key={d.key} className="contents">
                    <div
                      className="text-[10px] font-semibold text-right pr-1 cursor-pointer"
                      style={{ height: 16 }}
                      onClick={() => setSelectedDay(dayDate)}
                      title="Bekijk dagoverzicht"
                    >
                      {d.label}
                    </div>
                    {HOURS.map((h) => {
                      const cnt = heat[d.key][h];
                      return (
                        <div
                          key={h}
                          style={getStyles(cnt, false)}
                          title={`${cnt}× op ${d.label}, ${h}:00`}
                        >
                          {cnt ? cnt : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            {/* Desktop */}
            <div className="hidden md:grid grid-cols-[38px_repeat(24,24px)] gap-[2px]" style={{ minWidth: minWidthDesktop }}>
              <div />
              {HOURS.map((h) => (
                <div key={h} className="text-[10px] font-mono text-center" style={{ width: 24 }}>
                  {h.toString().padStart(2, "0")}
                </div>
              ))}
              {DAYS.map((d) => {
                const dayDate = addDays(weekStart, (d.key + 6) % 7);
                return (
                  <div key={d.key} className="contents">
                    <div
                      className="text-xs font-semibold text-right pr-1 cursor-pointer"
                      style={{ height: 20 }}
                      onClick={() => setSelectedDay(dayDate)}
                      title="Bekijk dagoverzicht"
                    >
                      {d.label}
                    </div>
                    {HOURS.map((h) => {
                      const cnt = heat[d.key][h];
                      return (
                        <div
                          key={h}
                          style={getStyles(cnt, true)}
                          title={`${cnt}× op ${d.label}, ${h}:00`}
                        >
                          {cnt ? cnt : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex gap-1 items-center mt-2 text-xs">
          <span>Weinig</span>
          <div className="w-4 h-4 rounded bg-green-100"></div>
          <div className="w-4 h-4 rounded bg-green-300"></div>
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>Veel</span>
        </div>
      </Card>
      {/* Dag-modal */}
      {selectedDay && (
        <SmokeDayDetailModal
          day={selectedDay}
          logs={logs.filter((l) => isSameDay(l.timestamp, selectedDay))}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
}
