"use client";

import { useState, useMemo } from "react";
import type { PomodoroSession } from "@/lib/types";

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

const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getIntensityClass(count: number): string {
  if (count === 0) return "";
  if (count <= 2) return "bg-teal-100 text-teal-900";
  if (count <= 5) return "bg-teal-200 text-teal-900";
  if (count <= 8) return "bg-teal-300 text-teal-950";
  return "bg-teal-500 text-white";
}

export default function CalendarView({ sessions }: CalendarViewProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.completed),
    [sessions]
  );

  const dailyCounts = useMemo(() => {
    const map = new Map<string, { count: number; sessions: PomodoroSession[] }>();
    for (const s of completedSessions) {
      const d = new Date(s.endDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const entry = map.get(key) || { count: 0, sessions: [] };
      entry.count++;
      entry.sessions.push(s);
      map.set(key, entry);
    }
    return map;
  }, [completedSessions]);

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
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
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
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
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
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
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

  const monthLabel = currentMonth.toLocaleDateString("zh-CN", {
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
            aria-label="上个月"
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
            <h2 className="text-lg font-semibold text-teal-950">{monthLabel}</h2>
            <button onClick={goToToday} className="btn btn-muted px-2 py-0.5 text-xs">
              今天
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="icon-btn"
            aria-label="下个月"
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
          本月完成{" "}
          <span className="font-semibold text-teal-600">{totalThisMonth}</span> 个番茄
        </p>
      </div>

      <div className="grid grid-cols-7 mb-1 px-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`text-center text-xs font-medium py-2 ${
              i >= 5 ? "text-orange-500" : "text-slate-400"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="grid grid-cols-7 gap-px bg-teal-100/80">
        {calendarDays.map((day, idx) => {
          const intensity = getIntensityClass(day.count);
          const isSelected =
            selectedDay && isSameDay(selectedDay.date, day.date);

          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(day)}
              className={`
                relative flex flex-col items-center justify-center
                h-14 bg-white transition-colors cursor-pointer
                ${!day.isCurrentMonth ? "text-slate-300" : "text-teal-950"}
                ${day.isToday ? "z-10 shadow-[inset_0_0_0_2px_#0d9488]" : ""}
                ${isSelected && day.isCurrentMonth ? "bg-teal-50" : ""}
                ${day.isCurrentMonth && !day.count ? "hover:bg-teal-50/60" : ""}
                ${day.isCurrentMonth && day.count ? "hover:brightness-[0.97]" : ""}
              `}
            >
              {day.count > 0 && day.isCurrentMonth && (
                <div className={`absolute inset-0 ${intensity} opacity-70`} />
              )}

              <span className="relative text-sm font-medium leading-none">
                {day.date.getDate()}
              </span>

              {day.count > 0 && day.isCurrentMonth && (
                <span className="relative mt-0.5 text-[10px] font-semibold leading-none tabular-nums">
                  {day.count}
                </span>
              )}

              {day.count > 0 && !day.isCurrentMonth && (
                <div className="mt-0.5 flex gap-0.5">
                  {Array.from({ length: Math.min(day.count, 4) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full bg-teal-300"
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
        </div>
      </div>

      {selectedDay && (
        <div className="card mt-4 p-4">
          <h3 className="text-sm font-semibold text-teal-950 mb-2">
            {selectedDay.date.toLocaleDateString("zh-CN", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </h3>

          {selectedDay.sessions.length === 0 ? (
            <p className="subtitle">当天没有完成的番茄记录</p>
          ) : (
            <div className="space-y-2">
              <p className="subtitle">
                完成{" "}
                <span className="font-semibold text-teal-600">{selectedDay.count}</span>{" "}
                个番茄
              </p>
              <div className="space-y-1.5">
                {selectedDay.sessions.map((s) => {
                  const start = new Date(s.startDate);
                  const end = new Date(s.endDate);
                  const durationMin = Math.round(
                    (end.getTime() - start.getTime()) / 60000
                  );
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between text-xs text-slate-500 bg-teal-50 rounded-lg px-3 py-2"
                    >
                      <span>
                        {start.toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {end.toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-slate-400">{durationMin} 分钟</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
