export type TimerMode = "idle" | "focusing" | "paused";

export interface PomodoroSession {
  id: string;
  startDate: string;
  endDate: string;
  plannedSeconds: number;
  completed: boolean;
}

export interface TargetChange {
  id: string;
  date: string;
  oldValue: number;
  newValue: number;
}

export interface AppState {
  weeklyTarget: number;
  sessions: PomodoroSession[];
  targetChanges: TargetChange[];
}

export const FOCUS_SECONDS = 25 * 60;
export const DEFAULT_WEEKLY_TARGET = 40;
