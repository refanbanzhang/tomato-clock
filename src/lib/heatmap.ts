import type { PomodoroSession } from "./types";

export const HEAT_WEEKS = 53;

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatDay {
  key: string;
  date: Date;
  minutes: number;
  level: HeatLevel;
  future: boolean;
}

export function levelForMinutes(minutes: number): HeatLevel {
  if (minutes <= 0) return 0;
  if (minutes <= 25) return 1;
  if (minutes <= 50) return 2;
  if (minutes <= 100) return 3;
  return 4;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function minutesByDay(sessions: PomodoroSession[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const session of sessions) {
    if (!session.completed || session.deleted) continue;
    if (!Number.isFinite(session.plannedSeconds) || session.plannedSeconds <= 0) continue;
    const end = new Date(session.endDate);
    if (Number.isNaN(end.getTime())) continue;
    const key = dayKey(end);
    const minutes = Math.round(session.plannedSeconds / 60);
    totals.set(key, (totals.get(key) ?? 0) + minutes);
  }
  return totals;
}

export function buildHeatmap(
  sessions: PomodoroSession[],
  now: Date = new Date(),
  weeks: number = HEAT_WEEKS
): HeatDay[][] {
  const today = startOfDay(now);
  const totals = minutesByDay(sessions);
  const cursor = new Date(today);
  cursor.setDate(today.getDate() - (weeks - 1) * 7 - today.getDay());

  const columns: HeatDay[][] = [];
  for (let week = 0; week < weeks; week++) {
    const days: HeatDay[] = [];
    for (let row = 0; row < 7; row++) {
      const date = new Date(cursor);
      const future = date > today;
      const key = dayKey(date);
      const minutes = future ? 0 : (totals.get(key) ?? 0);
      days.push({
        key,
        date,
        minutes,
        level: levelForMinutes(minutes),
        future,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    columns.push(days);
  }
  return columns;
}

export function totalMinutes(weeks: HeatDay[][]): number {
  let sum = 0;
  for (const week of weeks) {
    for (const day of week) {
      if (!day.future) sum += day.minutes;
    }
  }
  return sum;
}

export function monthLabelDate(week: HeatDay[], index: number): Date | null {
  const firstOfMonth = week.find((day) => !day.future && day.date.getDate() === 1);
  if (firstOfMonth) return firstOfMonth.date;
  if (index !== 0) return null;
  const first = week.find((day) => !day.future);
  return first ? first.date : null;
}
