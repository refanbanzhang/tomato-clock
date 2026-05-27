import {
  AppState,
  DEFAULT_WEEKLY_TARGET,
  PomodoroSession,
  TargetChange,
} from "./types";

export const EXPORT_VERSION = 1;

export interface ExportPayload {
  version: number;
  exportedAt: string;
  state: AppState;
}

export class DataImportError extends Error {
  constructor(public readonly code: ImportErrorCode) {
    super(code);
    this.name = "DataImportError";
  }
}

export type ImportErrorCode = "invalidJson" | "invalidFormat";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function parseSession(value: unknown): PomodoroSession | null {
  if (!isRecord(value)) return null;
  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.startDate) ||
    !isNonEmptyString(value.endDate) ||
    typeof value.plannedSeconds !== "number" ||
    typeof value.completed !== "boolean"
  ) {
    return null;
  }
  return {
    id: value.id,
    startDate: value.startDate,
    endDate: value.endDate,
    plannedSeconds: value.plannedSeconds,
    completed: value.completed,
  };
}

function parseTargetChange(value: unknown): TargetChange | null {
  if (!isRecord(value)) return null;
  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.date) ||
    typeof value.oldValue !== "number" ||
    typeof value.newValue !== "number"
  ) {
    return null;
  }
  return {
    id: value.id,
    date: value.date,
    oldValue: value.oldValue,
    newValue: value.newValue,
  };
}

function validateAppState(raw: unknown): AppState {
  if (!isRecord(raw)) {
    throw new DataImportError("invalidFormat");
  }

  const weeklyTarget =
    typeof raw.weeklyTarget === "number"
      ? Math.max(1, Math.min(999, raw.weeklyTarget))
      : DEFAULT_WEEKLY_TARGET;

  if (!Array.isArray(raw.sessions)) {
    throw new DataImportError("invalidFormat");
  }

  const sessions: PomodoroSession[] = [];
  for (const item of raw.sessions) {
    const session = parseSession(item);
    if (!session) {
      throw new DataImportError("invalidFormat");
    }
    sessions.push(session);
  }

  const targetChanges: TargetChange[] = [];
  if (raw.targetChanges != null) {
    if (!Array.isArray(raw.targetChanges)) {
      throw new DataImportError("invalidFormat");
    }
    for (const item of raw.targetChanges) {
      const change = parseTargetChange(item);
      if (!change) {
        throw new DataImportError("invalidFormat");
      }
      targetChanges.push(change);
    }
  }

  return { weeklyTarget, sessions, targetChanges };
}

function isExportPayload(value: unknown): value is ExportPayload {
  return (
    isRecord(value) &&
    typeof value.version === "number" &&
    isNonEmptyString(value.exportedAt) &&
    isRecord(value.state)
  );
}

export function buildExportPayload(state: AppState): ExportPayload {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  };
}

export function downloadStateExport(state: AppState): void {
  const payload = buildExportPayload(state);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `tomato-clock-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseImportData(text: string): AppState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new DataImportError("invalidJson");
  }

  const raw = isExportPayload(parsed) ? parsed.state : parsed;
  return validateAppState(raw);
}
