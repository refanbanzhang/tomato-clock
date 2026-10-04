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
  onComplete: (plannedSeconds: number, tag?: string) => void,
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
    (prev: TimerState) => {
      if (finishing.current || prev.mode !== "focusing") return;
      finishing.current = true;
      stop();
      const next = createInitialTimerState(Date.now(), totalSeconds);
      clockRef.current = next;
      setTimer(next);
      // 必须在这次计时回调里直接发完成事件。
      // 放进 setTimeout 后，后台标签页会把这个定时器再推迟，Mac 通知就发不出去。
      console.log("[clock] finish", {
        storageKey,
        plannedSeconds: prev.totalSeconds,
        hidden: document.hidden,
      });
      onCompleteRef.current(prev.totalSeconds, prev.tag);
    },
    [stop, storageKey, totalSeconds],
  );

  useEffect(() => {
    clockRef.current = timer;
    saveTimerState(timer, storageKey);
  }, [timer, storageKey]);

  const startTick = useCallback(() => {
    stop();
    tickRef.current = setInterval(() => {
      const prev = clockRef.current;
      if (prev.mode !== "focusing" || prev.endAt == null) return;
      const remainingSeconds = getRemainingSeconds(prev.endAt);
      if (remainingSeconds <= 0) {
        finish(prev);
        return;
      }
      const next = { ...prev, remainingSeconds };
      clockRef.current = next;
      setTimer(next);
    }, 1000);
  }, [finish, stop]);

  const start = useCallback((tag: string) => {
    const name = tag.trim();
    if (!name) throw new Error("先选一个标签");
    finishing.current = false;
    const endAt = Date.now() + totalSeconds * 1000;
    const next: TimerState = {
      mode: "focusing",
      remainingSeconds: totalSeconds,
      totalSeconds,
      endAt,
      updatedAt: Date.now(),
      tag: name,
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
            tag: prev.tag,
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

  const setTag = useCallback((tag: string) => {
    const name = tag.trim();
    if (!name) throw new Error("先选一个标签");
    const prev = clockRef.current;
    if (prev.mode !== "paused") return;
    const next = { ...prev, tag: name, updatedAt: Date.now() };
    clockRef.current = next;
    setTimer(next);
  }, []);

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
      finish(current);
      return;
    }
    startTick();
    return stop;
  }, [finish, startTick, stop]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const prev = clockRef.current;
      const synced = syncTimerFromWallClock(prev);
      if (synced.mode === "focusing" && synced.remainingSeconds <= 0) {
        finish(synced);
        return;
      }
      clockRef.current = synced;
      setTimer(synced);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [finish]);

  useEffect(() => () => stop(), [stop]);

  return { timer, start, pause, resume, abandon, setTag };
}
