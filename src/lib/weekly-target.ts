import type { PomodoroSession } from "./types";
import { countInWeek } from "./stats";

export function willReachWeeklyTarget(
  sessions: PomodoroSession[],
  weeklyTarget: number,
  anchor: Date = new Date()
): boolean {
  const count = countInWeek(sessions, anchor);
  return count < weeklyTarget && count + 1 >= weeklyTarget;
}
