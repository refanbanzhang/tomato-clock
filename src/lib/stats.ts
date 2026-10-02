import type { PomodoroSession } from "./types";

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function countToday(
  sessions: PomodoroSession[],
  now: Date = new Date()
): number {
  return sessions.filter((s) => isSameDay(new Date(s.endDate), now)).length;
}
