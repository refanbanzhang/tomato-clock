
import { useMemo } from "react";
import type { PomodoroSession } from "@/lib/types";
import { countInWeek } from "@/lib/stats";
import { useLocale } from "@/lib/i18n";

interface WeeklyProgressProps {
  sessions: PomodoroSession[];
  weeklyTarget: number;
}

export default function WeeklyProgress({
  sessions,
  weeklyTarget,
}: WeeklyProgressProps) {
  const { t } = useLocale();
  const count = useMemo(() => countInWeek(sessions), [sessions]);
  const safeTarget = weeklyTarget > 0 ? weeklyTarget : 1;
  const percent = Math.min(100, Math.round((count / safeTarget) * 100));
  const done = count >= safeTarget;

  return (
    <div className="goal card">
      <div className="goal-head">
        <div className="goal-label-wrap">
          <span className="goal-label">{t("weeklyProgress")}</span>
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
        aria-label={t("weeklyProgress")}
      >
        <div
          className={`goal-bar${done ? " goal-bar-done" : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
