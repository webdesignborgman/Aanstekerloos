// components/smoke/WeekNavigator.tsx
"use client";

import { format, addWeeks, subWeeks, isSameWeek, endOfWeek } from "date-fns";

interface WeekNavigatorProps {
  weekStart: Date;
  onChangeWeek: (next: Date) => void;
}

export function WeekNavigator({ weekStart, onChangeWeek }: WeekNavigatorProps) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const isCurrent = isSameWeek(weekStart, new Date(), { weekStartsOn: 1 });

  return (
    <div className="flex items-center justify-between mb-2">
      <button onClick={() => onChangeWeek(subWeeks(weekStart, 1))}>
        ← Vorige week
      </button>
      <span className="font-medium">
        Week van {format(weekStart, "dd MMM")} t/m {format(weekEnd, "dd MMM")}
      </span>
      <button
        onClick={() => onChangeWeek(addWeeks(weekStart, 1))}
        disabled={isCurrent}
        className={isCurrent ? "opacity-50 cursor-not-allowed" : ""}
      >
        Volgende week →
      </button>
    </div>
  );
}
