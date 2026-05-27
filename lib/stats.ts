import type { PomodoroSession } from "./types";

/**
 * @deprecated Use translations from useLocale() instead.
 * Kept for backward compatibility.
 */
export const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

export interface DayAggregate {
  count: number;
  sessions: PomodoroSession[];
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getCompletedSessions(
  sessions: PomodoroSession[]
): PomodoroSession[] {
  return sessions.filter((s) => s.completed);
}

export function groupByDay(
  sessions: PomodoroSession[]
): Map<string, DayAggregate> {
  const map = new Map<string, DayAggregate>();
  for (const s of getCompletedSessions(sessions)) {
    const d = new Date(s.endDate);
    const key = dateKey(d);
    const entry = map.get(key) || { count: 0, sessions: [] };
    entry.count++;
    entry.sessions.push(s);
    map.set(key, entry);
  }
  return map;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function getWeekDays(anchor: Date): Date[] {
  const start = getWeekStart(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function countInRange(
  sessions: PomodoroSession[],
  start: Date,
  end: Date
): number {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return getCompletedSessions(sessions).filter((s) => {
    const t = new Date(s.endDate).getTime();
    return t >= startMs && t <= endMs;
  }).length;
}

export function countInWeek(
  sessions: PomodoroSession[],
  anchor: Date = new Date()
): number {
  const start = getWeekStart(anchor);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return countInRange(sessions, start, end);
}

export function countInMonth(
  sessions: PomodoroSession[],
  year: number,
  month: number
): number {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return countInRange(sessions, start, end);
}

export function countInYear(
  sessions: PomodoroSession[],
  year: number
): number {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return countInRange(sessions, start, end);
}

export function getIntensityClass(count: number): string {
  if (count === 0) return "";
  if (count <= 2) return "bg-teal-100 text-teal-900";
  if (count <= 5) return "bg-teal-200 text-teal-900";
  if (count <= 8) return "bg-teal-300 text-teal-950";
  return "bg-teal-500 text-white";
}
