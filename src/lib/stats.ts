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

export const GOAL_HOURS = 10000;
const UNTAGGED = "未分类";

export interface TagHours {
  tag: string;
  hours: number;
}

function sessionHours(session: PomodoroSession): number {
  if (!Number.isFinite(session.plannedSeconds) || session.plannedSeconds <= 0) return 0;
  return session.plannedSeconds / 3600;
}

/** 每个标签一条进度。没有标签的旧记录并进「未分类」。 */
export function hoursByTag(sessions: PomodoroSession[], tags: string[]): TagHours[] {
  const totals = new Map<string, number>();
  for (const tag of tags) totals.set(tag, 0);
  let untagged = 0;
  for (const session of sessions) {
    const hours = sessionHours(session);
    if (hours === 0) continue;
    if (!session.tag) {
      untagged += hours;
      continue;
    }
    totals.set(session.tag, (totals.get(session.tag) ?? 0) + hours);
  }
  const rows = [...totals.entries()].map(([tag, hours]) => ({ tag, hours }));
  if (untagged <= 0) return rows;
  const bucket = rows.find((row) => row.tag === UNTAGGED);
  if (bucket) bucket.hours += untagged;
  else rows.push({ tag: UNTAGGED, hours: untagged });
  return rows;
}
