"use client";

import { useMemo } from "react";
import type { PomodoroSession } from "@/lib/types";
import { countInWeek, countInMonth, countInYear } from "@/lib/stats";
import { useLocale, type TFn } from "@/lib/i18n";

type TimeRange = "week" | "month" | "year";

interface GoalProgressProps {
  sessions: PomodoroSession[];
  target: number;
  timeRange: TimeRange;
}

function getCount(
  sessions: PomodoroSession[],
  timeRange: TimeRange
): number {
  const now = new Date();
  switch (timeRange) {
    case "week":
      return countInWeek(sessions, now);
    case "month":
      return countInMonth(sessions, now.getFullYear(), now.getMonth());
    case "year":
      return countInYear(sessions, now.getFullYear());
  }
}

function getLabelKey(timeRange: TimeRange): string {
  switch (timeRange) {
    case "week":
      return "weeklyProgress" as const;
    case "month":
      return "monthlyProgress" as const;
    case "year":
      return "yearlyProgress" as const;
  }
}

export default function GoalProgress({
  sessions,
  target,
  timeRange,
}: GoalProgressProps) {
  const { t } = useLocale();
  const count = useMemo(() => getCount(sessions, timeRange), [sessions, timeRange]);
  const safeTarget = target > 0 ? target : 1;
  const percent = Math.min(100, Math.round((count / safeTarget) * 100));
  const done = count >= safeTarget;

  return (
    <div className="card w-full px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t(getLabelKey(timeRange) as Parameters<TFn>[0])}
          </span>
          {done && (
            <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/15 rounded-full px-1.5 py-0.5">
              {t("weeklyProgressDone")}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          <span className="font-semibold text-teal-600 dark:text-teal-400">
            {count}
          </span>
          {" / "}
          {safeTarget} {t("weeklyProgressUnit")}
        </p>
      </div>
      <div
        className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden"
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={safeTarget}
        aria-label={t(getLabelKey(timeRange) as Parameters<TFn>[0])}
      >
        <div
          className={
            "h-full rounded-full transition-all duration-500 ease-out " +
            (done
              ? "bg-orange-500"
              : "bg-teal-500")
          }
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
