import {
  AppState,
  StatsMode,
  PomodoroSession,
  ProgressSnapshot,
  DEFAULT_WEEKLY_TARGET,
} from "./types";

const STORAGE_KEY = "tomato-clock-state";

export function loadState(): AppState {
  if (typeof window === "undefined") {
    return {
      weeklyTarget: DEFAULT_WEEKLY_TARGET,
      statsMode: "calendarWeek",
      sessions: [],
      targetChanges: [],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        weeklyTarget: parsed.weeklyTarget ?? DEFAULT_WEEKLY_TARGET,
        statsMode: parsed.statsMode ?? "calendarWeek",
        sessions: parsed.sessions ?? [],
        targetChanges: parsed.targetChanges ?? [],
      };
    }
  } catch {
    // corrupted data, reset
  }
  return {
    weeklyTarget: DEFAULT_WEEKLY_TARGET,
    statsMode: "calendarWeek",
    sessions: [],
    targetChanges: [],
  };
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getWeekStart(now: Date, mode: StatsMode): Date {
  const d = new Date(now);
  if (mode === "calendarWeek") {
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday = 0
    d.setDate(d.getDate() - diff);
  } else {
    d.setDate(d.getDate() - 6);
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function computeProgress(state: AppState, now: Date): ProgressSnapshot {
  const weekStart = getWeekStart(now, state.statsMode);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const completedThisWeek = state.sessions.filter(
    (s) => s.completed && new Date(s.endDate) >= weekStart
  );

  const todayCompleted = completedThisWeek.filter(
    (s) => isSameDay(new Date(s.endDate), today)
  ).length;

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekStart);

  const lastWeekCompleted = state.sessions.filter(
    (s) =>
      s.completed &&
      new Date(s.endDate) >= lastWeekStart &&
      new Date(s.endDate) < lastWeekEnd
  ).length;

  const dailyCounts: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const count = completedThisWeek.filter((s) =>
      isSameDay(new Date(s.endDate), d)
    ).length;
    dailyCounts.push({
      date: d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
      count,
    });
  }

  const completed = completedThisWeek.length;
  const target = state.weeklyTarget;
  const percent = Math.min(100, Math.round((completed / target) * 100));

  return { completed, target, percent, todayCompleted, lastWeekCompleted, dailyCounts };
}

export function addSession(state: AppState, session: PomodoroSession): AppState {
  return { ...state, sessions: [...state.sessions, session] };
}

export function setWeeklyTarget(state: AppState, newTarget: number): AppState {
  return {
    ...state,
    weeklyTarget: newTarget,
    targetChanges: [
      ...state.targetChanges,
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        oldValue: state.weeklyTarget,
        newValue: newTarget,
      },
    ],
  };
}

export function setStatsMode(state: AppState, mode: StatsMode): AppState {
  return { ...state, statsMode: mode };
}
