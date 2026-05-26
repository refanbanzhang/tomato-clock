export type TimerMode = "idle" | "focusing" | "paused" | "resting";

export type BreakType = "short" | "long";

export type StatsMode = "calendarWeek" | "rollingSevenDays";

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
  statsMode: StatsMode;
  sessions: PomodoroSession[];
  targetChanges: TargetChange[];
}

export interface ProgressSnapshot {
  completed: number;
  target: number;
  percent: number;
  todayCompleted: number;
  lastWeekCompleted: number;
  dailyCounts: { date: string; count: number }[];
}

export const FOCUS_SECONDS = 25 * 60;
export const SHORT_BREAK_SECONDS = 5 * 60;
export const LONG_BREAK_SECONDS = 15 * 60;
export const LONG_BREAK_INTERVAL = 4;
export const DEFAULT_WEEKLY_TARGET = 40;
