import { useCallback, useEffect, useRef, useState } from "react";
import {
  createInitialTimerState,
  getRemainingSeconds,
  loadTimerState,
  saveTimerState,
  syncTimerFromWallClock,
  TimerState,
} from "@/lib/timer-engine";

export function useWallClock(
  storageKey: string,
  totalSeconds: number,
  onComplete: (plannedSeconds: number) => void,
) {
  const [timer, setTimer] = useState<TimerState>(() =>
    loadTimerState(storageKey, totalSeconds),
  );
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef = useRef(timer);
  const onCompleteRef = useRef(onComplete);
  const finishing = useRef(false);
  onCompleteRef.current = onComplete;

  const stop = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (prev: TimerState): TimerState => {
      if (finishing.current) {
        return createInitialTimerState(Date.now(), totalSeconds);
      }
      finishing.current = true;
      stop();
      const next = createInitialTimerState(Date.now(), totalSeconds);
      clockRef.current = next;
      const planned = prev.totalSeconds;
      setTimeout(() => {
        finishing.current = false;
        onCompleteRef.current(planned);
      }, 0);
      return next;
    },
    [stop, totalSeconds],
  );

  useEffect(() => {
    clockRef.current = timer;
    saveTimerState(timer, storageKey);
  }, [timer, storageKey]);

  const startTick = useCallback(() => {
    stop();
    tickRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev.mode !== "focusing" || prev.endAt == null) return prev;
        const remainingSeconds = getRemainingSeconds(prev.endAt);
        if (remainingSeconds <= 0) return finish(prev);
        const next = { ...prev, remainingSeconds };
        clockRef.current = next;
        return next;
      });
    }, 1000);
  }, [finish, stop]);

  const start = useCallback(() => {
    const endAt = Date.now() + totalSeconds * 1000;
    const next: TimerState = {
      mode: "focusing",
      remainingSeconds: totalSeconds,
      totalSeconds,
      endAt,
      updatedAt: Date.now(),
    };
    clockRef.current = next;
    setTimer(next);
    startTick();
  }, [startTick, totalSeconds]);

  const pause = useCallback(() => {
    stop();
    const prev = clockRef.current;
    const next: TimerState =
      prev.mode !== "focusing" || prev.endAt == null
        ? { ...prev, mode: "paused", updatedAt: Date.now() }
        : {
            mode: "paused",
            remainingSeconds: getRemainingSeconds(prev.endAt),
            totalSeconds: prev.totalSeconds,
            updatedAt: Date.now(),
          };
    clockRef.current = next;
    setTimer(next);
  }, [stop]);

  const resume = useCallback(() => {
    const prev = clockRef.current;
    const next: TimerState = {
      ...prev,
      mode: "focusing",
      endAt: Date.now() + prev.remainingSeconds * 1000,
      updatedAt: Date.now(),
    };
    clockRef.current = next;
    setTimer(next);
    startTick();
  }, [startTick]);

  const abandon = useCallback(() => {
    stop();
    const next = createInitialTimerState(Date.now(), totalSeconds);
    clockRef.current = next;
    setTimer(next);
  }, [stop, totalSeconds]);

  useEffect(() => {
    const current = clockRef.current;
    if (current.mode !== "focusing") return;
    if (current.endAt == null || getRemainingSeconds(current.endAt) <= 0) {
      setTimer((prev) => finish(prev));
      return;
    }
    startTick();
    return stop;
  }, [finish, startTick, stop]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      setTimer((prev) => {
        const synced = syncTimerFromWallClock(prev);
        if (synced.mode === "focusing" && synced.remainingSeconds <= 0) {
          return finish(synced);
        }
        clockRef.current = synced;
        return synced;
      });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [finish]);

  useEffect(() => () => stop(), [stop]);

  return { timer, start, pause, resume, abandon };
}
