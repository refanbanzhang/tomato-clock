"use client";

import { useMemo } from "react";
import type { PomodoroSession } from "@/lib/types";
import { countInWeek, countInMonth, countInYear } from "@/lib/stats";

interface StatsSummaryProps {
  sessions: PomodoroSession[];
  weeklyTarget?: number;
}

export default function StatsSummary({
  sessions,
  weeklyTarget,
}: StatsSummaryProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return {
      week: countInWeek(sessions, now),
      month: countInMonth(sessions, year, month),
      year: countInYear(sessions, year),
    };
  }, [sessions]);

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <div className="card p-3 text-center">
        <p className="text-xs text-slate-400 mb-1">本周</p>
        <p className="text-xl font-semibold text-teal-600 tabular-nums">
          {stats.week}
        </p>
        {weeklyTarget !== undefined && (
          <p className="text-[10px] text-slate-400 mt-0.5">
            目标 {weeklyTarget}
          </p>
        )}
      </div>
      <div className="card p-3 text-center">
        <p className="text-xs text-slate-400 mb-1">本月</p>
        <p className="text-xl font-semibold text-teal-600 tabular-nums">
          {stats.month}
        </p>
      </div>
      <div className="card p-3 text-center">
        <p className="text-xs text-slate-400 mb-1">今年</p>
        <p className="text-xl font-semibold text-teal-600 tabular-nums">
          {stats.year}
        </p>
      </div>
    </div>
  );
}
