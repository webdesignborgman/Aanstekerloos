// components/smoke/SmokeLogList.tsx
"use client";

import { SmokeLog } from "@/types/smokeLog";
import { format } from "date-fns";

interface Props {
  logs: SmokeLog[];
}

export function SmokeLogList({ logs }: Props) {
  const sorted = [...logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return (
    <div className="space-y-2">
      {sorted.map(l => (
        <div key={l.id} className="bg-card p-3 rounded-lg shadow">
          <div className="flex justify-between">
            <span className="font-mono">{format(l.timestamp, "dd/MM/yyyy HH:mm")}</span>
            <span>{l.emotions?.join(", ") || "–"}</span>
          </div>
          <div className="text-sm">
            {l.triggers?.join(", ") || "–"} {l.note && <em>– “{l.note}”</em>}
          </div>
        </div>
      ))}
    </div>
  );
}
