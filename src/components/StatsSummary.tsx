
import { useMemo } from "react";
import type { PomodoroSession } from "@/lib/types";
import { countInWeek, countInMonth, countInYear } from "@/lib/stats";
import { useLocale } from "@/lib/i18n";

interface StatsSummaryProps {
  sessions: PomodoroSession[];
  weeklyTarget?: number;
  monthlyTarget?: number;
  yearlyTarget?: number;
}

export default function StatsSummary({
  sessions,
  weeklyTarget,
  monthlyTarget,
  yearlyTarget,
}: StatsSummaryProps) {
  const { t } = useLocale();
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

  const items = [
    { label: t("thisWeek"), value: stats.week, target: weeklyTarget },
    { label: t("thisMonth"), value: stats.month, target: monthlyTarget },
    { label: t("thisYear"), value: stats.year, target: yearlyTarget },
  ];

  return (
    <div className="stat-strip card">
      {items.map((item) => (
        <div key={item.label} className="stat-item">
          <p className="stat-label">{item.label}</p>
          <p className="stat-val">{item.value}</p>
          {item.target !== undefined && (
            <p className="stat-target">
              {t("target")} {item.target}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
