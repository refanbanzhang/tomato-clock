import { useCallback, useEffect, useRef, useState } from "react";
import ClockScreen from "@/components/ClockScreen";
import SideBoard from "@/components/SideBoard";
import Toast from "@/components/Toast";
import { useAudio, useKeyboardShortcut, useNotification } from "@/components/hooks";
import { addSession, loadState, saveState } from "@/lib/store";
import { scheduleSync } from "@/lib/sync";
import { useWallClock } from "@/lib/use-clock";
import { FOCUS_TIMER_KEY } from "@/lib/timer-engine";
import { asset } from "@/lib/asset";
import { AppState, FOCUS_SECONDS, PomodoroSession } from "@/lib/types";

const TITLE = "番茄时钟";

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>(() => loadState());
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null);
  const appStateRef = useRef(appState);
  const { requestPermission, notify } = useNotification();
  const { playBeep } = useAudio();

  const applySessions = useCallback((sessions: PomodoroSession[]) => {
    const next = { sessions };
    appStateRef.current = next;
    setAppState(next);
  }, []);

  const runSync = useCallback(() => {
    return scheduleSync(() => appStateRef.current?.sessions ?? [], applySessions).then(
      () => undefined,
      (error: unknown) => {
        console.warn("[sync] failed", error);
      },
    );
  }, [applySessions]);

  const onFocusDone = useCallback(
    (plannedSeconds: number) => {
      const current = appStateRef.current;
      if (!current) {
        console.warn("[tomato-clock] focus complete skipped: app state not ready");
        return;
      }
      const now = new Date();
      const next = addSession(current, {
        id: crypto.randomUUID(),
        startDate: new Date(now.getTime() - plannedSeconds * 1000).toISOString(),
        endDate: now.toISOString(),
        plannedSeconds,
      });
      appStateRef.current = next;
      setAppState(next);
      notify("番茄完成", "已记录。");
      playBeep();
      setToast({ message: "番茄完成！", sub: "已记录，继续保持节奏" });
      void runSync();
    },
    [notify, playBeep, runSync],
  );

  const focus = useWallClock(FOCUS_TIMER_KEY, FOCUS_SECONDS, onFocusDone);

  useEffect(() => {
    appStateRef.current = appState;
    saveState(appState);
  }, [appState]);

  useEffect(() => {
    void runSync();
    const kick = () => {
      if (document.visibilityState === "visible") void runSync();
    };
    const onOnline = () => void runSync();
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("online", onOnline);
    };
  }, [runSync]);

  const press = useCallback(
    (clock: typeof focus) => {
      if (clock.timer.mode === "idle") {
        requestPermission();
        clock.start();
        return;
      }
      if (clock.timer.mode === "focusing") {
        clock.pause();
        return;
      }
      clock.resume();
    },
    [requestPermission],
  );

  const handleSpace = useCallback(() => {
    press(focus);
  }, [focus, press]);
  useKeyboardShortcut(" ", handleSpace, true);

  return (
    <div className="stage">
      <div className="phone">
        <ClockScreen
          title={TITLE}
          cat={asset("art/cat-timer.webp")}
          seconds={focus.timer.remainingSeconds}
          action={actionText(focus.timer.mode)}
          actionLabel={actionLabel(focus.timer.mode, "专注")}
          actionClass={actionClass(focus.timer.mode)}
          onAction={() => press(focus)}
        />
        {toast && (
          <Toast
            message={toast.message}
            sub={toast.sub}
            onDismiss={() => setToast(null)}
          />
        )}
      </div>
      <SideBoard sessions={appState.sessions} />
    </div>
  );
}

function actionText(mode: "idle" | "focusing" | "paused"): string {
  if (mode === "focusing") return "暂停";
  if (mode === "paused") return "继续";
  return "开始";
}

function actionClass(mode: "idle" | "focusing" | "paused"): string {
  if (mode === "focusing") return "go go-run";
  if (mode === "paused") return "go go-pause";
  return "go";
}

function actionLabel(mode: "idle" | "focusing" | "paused", name: string): string {
  if (mode === "focusing") return `暂停${name}`;
  if (mode === "paused") return `继续${name}`;
  return `开始${name}`;
}
