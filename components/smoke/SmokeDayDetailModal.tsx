// components/smoke/SmokeDayDetailModal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { SmokeLog } from "@/types/smokeLog";
import { format } from "date-fns";

interface Props {
  day: Date;
  logs: SmokeLog[];
  onClose: () => void;
}

export function SmokeDayDetailModal({ day, logs, onClose }: Props) {
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const counts = HOURS.map(h => logs.filter(l => l.timestamp.getHours() === h).length);
  const total = counts.reduce((sum, n) => sum + n, 0);
  const max = Math.max(1, ...counts);

  const getStyle = (count: number) => {
    const intensity = count / max;
    const light = 90 - 50 * intensity;
    return {
      backgroundColor: count ? `hsl(120,55%,${light}%)` : "#f3f4f6",
      color: intensity > 0.6 ? "#fff" : "#262626",
      width: "24px",
      height: "24px",
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "4px",
      fontSize: "12px",
      margin: "0 2px",
    };
  };

  const aggregate = (field: keyof SmokeLog) => {
    const map: Record<string, number> = {};
    logs.forEach(l => {
      const arr = Array.isArray(l[field]) ? (l[field] as string[]) : [];
      arr.forEach(v => map[v] = (map[v] || 0) + 1);
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  };

  const emotions = aggregate("emotions");
  const triggers = aggregate("triggers");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Dagoverzicht — {format(day, "EEEE, dd MMM")}</DialogTitle>
          <DialogClose />
        </DialogHeader>

        {/* Dagstatistiek */}
        <div className="space-y-2 mb-4">
          <div><strong>Totaal gerookt:</strong> {total}×</div>
          {emotions.length > 0 && <div><strong>Emoties:</strong> {emotions.map(e => `${e.name} (${e.count})`).join(", ")}</div>}
          {triggers.length > 0 && <div><strong>Triggers:</strong> {triggers.map(t => `${t.name} (${t.count})`).join(", ")}</div>}
        </div>

        {/* Heatmap met urenlabels */}
        <div className="mb-2 flex flex-col items-center">
          {/* Urenlabels boven blokken */}
          <div className="flex mb-1">
            {HOURS.slice(0,12).map(h => (
              <div key={`label-${h}`} className="text-[10px] font-mono text-center" style={{ width: 24, margin: "0 2px" }}>
                {h.toString().padStart(2, "0")}
              </div>
            ))}
          </div>
          <div className="flex">
            {HOURS.slice(0,12).map(h => (
              <div key={`block-${h}`} style={getStyle(counts[h])} title={`${counts[h]}× om ${h}:00`}>
                {counts[h] > 0 ? counts[h] : null}
              </div>
            ))}
          </div>

          {/* tweede rij urenlabels */}
          <div className="flex mt-3 mb-1">
            {HOURS.slice(12).map(h => (
              <div key={`label2-${h}`} className="text-[10px] font-mono text-center" style={{ width: 24, margin: "0 2px" }}>
                {h.toString().padStart(2, "0")}
              </div>
            ))}
          </div>
          <div className="flex">
            {HOURS.slice(12).map(h => (
              <div key={`block2-${h}`} style={getStyle(counts[h])} title={`${counts[h]}× om ${h}:00`}>
                {counts[h] > 0 ? counts[h] : null}
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Bovenste rij = 00–11 uur, onderste rij = 12–23 uur. Blokjes tonen kleur + getal.
        </div>
      </DialogContent>
    </Dialog>
  );
}
