
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
    <div className="goal card">
      <div className="goal-head">
        <div className="goal-label-wrap">
          <span className="goal-label">
            {t(getLabelKey(timeRange) as Parameters<TFn>[0])}
          </span>
          {done && <span className="goal-badge">{t("weeklyProgressDone")}</span>}
        </div>
        <p className="goal-count">
          <span className="goal-count-now">{count}</span>
          {" / "}
          {safeTarget} {t("weeklyProgressUnit")}
        </p>
      </div>
      <div
        className="goal-track"
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={safeTarget}
        aria-label={t(getLabelKey(timeRange) as Parameters<TFn>[0])}
      >
        <div
          className={`goal-bar${done ? " goal-bar-done" : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
