"use client";

import type { PomodoroSession } from "@/lib/types";
import { useLocale, formatDate, formatTime } from "@/lib/i18n";

interface DayDetailPanelProps {
  date: Date;
  count: number;
  sessions: PomodoroSession[];
}

export default function DayDetailPanel({
  date,
  count,
  sessions,
}: DayDetailPanelProps) {
  const { t, locale } = useLocale();

  return (
    <div className="card mt-4 p-4">
      <h3 className="text-sm font-semibold text-teal-950 dark:text-slate-100 mb-2">
        {formatDate(locale, date, {
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      </h3>

      {sessions.length === 0 ? (
        <p className="subtitle">{t("noPomodoros")}</p>
      ) : (
        <div className="space-y-2">
          <p className="subtitle">
            {t("completedTomatoes", { n: count })}
          </p>
          <div className="space-y-1.5">
            {sessions.map((s) => {
              const start = new Date(s.startDate);
              const end = new Date(s.endDate);
              const durationMin = Math.round(
                (end.getTime() - start.getTime()) / 60000
              );
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-teal-50 dark:bg-slate-700/40 rounded-lg px-3 py-2"
                >
                  <span>
                    {formatTime(locale, start, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {formatTime(locale, end, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">{durationMin} {t("minutesUnit")}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
