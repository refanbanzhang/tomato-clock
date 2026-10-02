import { useCallback, useEffect, useRef } from "react";
import type { AppState } from "@/lib/types";
import {
  getSyncToken,
  mergeBlobs,
  pull,
  push,
  sameBlob,
  sameTimer,
  stampBlob,
  toBlob,
  toState,
  toTimer,
} from "@/lib/sync";
import { syncTimerFromWallClock, type TimerState } from "@/lib/timer-engine";

export type SyncErrorType = "upload" | "pull";

interface SyncArgs {
  localReady: boolean;
  getState: () => AppState;
  getTimer: () => TimerState;
  onState: (state: AppState) => void;
  onTimer: (timer: TimerState) => void;
  onSyncError?: (type: SyncErrorType) => void;
}

const POLL_MS = 30_000;
const ERROR_TOAST_COOLDOWN_MS = 8000;

export function useSync({
  localReady,
  getState,
  getTimer,
  onState,
  onTimer,
  onSyncError,
}: SyncArgs) {
  const getStateRef = useRef(getState);
  const getTimerRef = useRef(getTimer);
  const onStateRef = useRef(onState);
  const onTimerRef = useRef(onTimer);
  const onErrorRef = useRef(onSyncError);
  getStateRef.current = getState;
  getTimerRef.current = getTimer;
  onStateRef.current = onState;
  onTimerRef.current = onTimer;
  onErrorRef.current = onSyncError;

  const running = useRef(false);
  const again = useRef(false);
  const lastErrorAt = useRef<Record<SyncErrorType, number>>({ upload: 0, pull: 0 });

  const report = useCallback((type: SyncErrorType) => {
    const notify = onErrorRef.current;
    if (!notify) return;
    const now = Date.now();
    if (now - lastErrorAt.current[type] < ERROR_TOAST_COOLDOWN_MS) return;
    lastErrorAt.current[type] = now;
    notify(type);
  }, []);

  const syncNow = useCallback(async () => {
    if (!getSyncToken()) return;
    if (running.current) {
      again.current = true;
      return;
    }
    running.current = true;
    try {
      do {
        again.current = false;
        let remote;
        try {
          remote = await pull();
        } catch (error) {
          console.warn("[sync] pull failed", error);
          report("pull");
          if (!again.current) break;
          continue;
        }

        try {
          const local = toBlob(getStateRef.current(), getTimerRef.current());
          const stamped = stampBlob(mergeBlobs(local, remote));
          const recordsChanged =
            stamped.settingsUpdatedAt !== local.settingsUpdatedAt ||
            stamped.weeklyTarget !== local.weeklyTarget ||
            stamped.monthlyTarget !== local.monthlyTarget ||
            stamped.yearlyTarget !== local.yearlyTarget ||
            JSON.stringify(stamped.sessions) !== JSON.stringify(local.sessions) ||
            JSON.stringify(stamped.targetChanges) !== JSON.stringify(local.targetChanges);
          if (recordsChanged) onStateRef.current(toState(stamped));
          if (!sameTimer(stamped.timer, local.timer)) {
            onTimerRef.current(syncTimerFromWallClock(toTimer(stamped)));
          }
          if (!sameBlob(stamped, remote)) {
            await push(stamped);
            console.info("[sync] push", { sessions: stamped.sessions.length });
          }
        } catch (error) {
          console.warn("[sync] push failed", error);
          report("upload");
        }
      } while (again.current);
    } finally {
      running.current = false;
    }
  }, [report]);

  useEffect(() => {
    if (!localReady || !getSyncToken()) return;
    void syncNow();
    const id = setInterval(() => void syncNow(), POLL_MS);
    const onOnline = () => void syncNow();
    window.addEventListener("online", onOnline);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", onOnline);
    };
  }, [localReady, syncNow]);

  return { syncNow };
}
