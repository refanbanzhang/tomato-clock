export type TimerMode = "idle" | "focusing" | "paused";

export interface PomodoroSession {
  id: string;
  startDate: string;
  endDate: string;
  plannedSeconds: number;
}

export interface AppState {
  sessions: PomodoroSession[];
}

export const FOCUS_SECONDS = 25 * 60;
