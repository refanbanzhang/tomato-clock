
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
      <h3 className="set-label mb-2">
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
                <div key={s.id} className="day-row">
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
                  <span className="day-row-dur">{durationMin} {t("minutesUnit")}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
