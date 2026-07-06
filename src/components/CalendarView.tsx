
import { useState, useMemo } from "react";
import type { PomodoroSession } from "@/lib/types";
import {
  groupByDay,
  isSameDay,
  getIntensityClass,
  dateKey,
} from "@/lib/stats";
import { useLocale, formatDate } from "@/lib/i18n";
import DayDetailPanel from "./DayDetailPanel";

interface CalendarViewProps {
  sessions: PomodoroSession[];
}

interface DayData {
  date: Date;
  count: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  sessions: PomodoroSession[];
}

export default function CalendarView({ sessions }: CalendarViewProps) {
  const today = new Date();
  const { t, locale } = useLocale();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const dailyCounts = useMemo(() => groupByDay(sessions), [sessions]);

  const weekdayLabels = useMemo(
    () => [
      t("weekday_mon"), t("weekday_tue"), t("weekday_wed"),
      t("weekday_thu"), t("weekday_fri"), t("weekday_sat"), t("weekday_sun"),
    ],
    [t]
  );

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: DayData[] = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const key = dateKey(d);
      const entry = dailyCounts.get(key);
      days.push({
        date: d,
        count: entry?.count ?? 0,
        isCurrentMonth: false,
        isToday: isSameDay(d, today),
        sessions: entry?.sessions ?? [],
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const key = dateKey(d);
      const entry = dailyCounts.get(key);
      days.push({
        date: d,
        count: entry?.count ?? 0,
        isCurrentMonth: true,
        isToday: isSameDay(d, today),
        sessions: entry?.sessions ?? [],
      });
    }

    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        const key = dateKey(d);
        const entry = dailyCounts.get(key);
        days.push({
          date: d,
          count: entry?.count ?? 0,
          isCurrentMonth: false,
          isToday: isSameDay(d, today),
          sessions: entry?.sessions ?? [],
        });
      }
    }

    return days;
  }, [currentMonth, dailyCounts, today]);

  const goToPrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(null);
  };

  const monthLabel = formatDate(locale, currentMonth, {
    year: "numeric",
    month: "long",
  });

  const totalThisMonth = calendarDays
    .filter((d) => d.isCurrentMonth)
    .reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="w-full">
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevMonth}
            className="icon-btn"
            aria-label={t("prevMonth")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <h2 className="cal-month">{monthLabel}</h2>
            <button onClick={goToToday} className="btn btn-muted px-2 py-0.5 text-xs">
              {t("today")}
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="icon-btn"
            aria-label={t("nextMonth")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <p className="subtitle text-center mt-3">
          {t("completedThisMonth", { n: totalThisMonth })}
        </p>
      </div>

      <div className="grid grid-cols-7 mb-1 px-1">
        {weekdayLabels.map((label, i) => (
          <div key={label} className={`cal-wd${i >= 5 ? " cal-wd-end" : ""}`}>
            {label}
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="cal-grid">
          {calendarDays.map((day, idx) => {
            const intensity =
              day.isCurrentMonth ? getIntensityClass(day.count) : "";
            const isSelected =
              selectedDay && isSameDay(selectedDay.date, day.date);
            const dayClass = [
              "cal-day",
              intensity,
              !day.isCurrentMonth && "cal-day-out",
              day.isToday && "cal-day-today",
              isSelected && !intensity && "cal-day-sel",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button key={idx} onClick={() => setSelectedDay(day)} className={dayClass}>
                <span className="cal-num">{day.date.getDate()}</span>

                {day.count > 0 && day.isCurrentMonth && (
                  <span className="cal-count">{day.count}</span>
                )}

                {day.count > 0 && !day.isCurrentMonth && (
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: Math.min(day.count, 4) }).map((_, i) => (
                      <div key={i} className="cal-dot" />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <DayDetailPanel
          date={selectedDay.date}
          count={selectedDay.count}
          sessions={selectedDay.sessions}
        />
      )}
    </div>
  );
}
