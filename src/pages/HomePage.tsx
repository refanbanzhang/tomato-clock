import { useCallback, useEffect, useRef, useState } from "react";
import ClockScreen from "@/components/ClockScreen";
import SideBoard from "@/components/SideBoard";
import TagPick from "@/components/TagPick";
import Toast from "@/components/Toast";
import ConfigPage from "@/pages/ConfigPage";
import { useAudio, useKeyboardShortcut, useNotification } from "@/components/hooks";
import { addSession, addTag, loadState, removeTag, saveState, selectTag, setSessionTag, unionTags } from "@/lib/store";
import { scheduleSync } from "@/lib/sync";
import { useWallClock } from "@/lib/use-clock";
import { FOCUS_TIMER_KEY } from "@/lib/timer-engine";
import { asset } from "@/lib/asset";
import { AppState, FOCUS_SECONDS, PomodoroSession } from "@/lib/types";

const TITLE = "番茄时钟";

function readPage(): "home" | "config" {
  return window.location.hash === "#/config" ? "config" : "home";
}

export default function HomePage() {
  const [page, setPage] = useState<"home" | "config">(readPage);
  const [appState, setAppState] = useState<AppState>(() => loadState());
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null);
  const appStateRef = useRef(appState);
  const { requestPermission, notify } = useNotification();
  const { playBeep } = useAudio();

  const commit = useCallback((next: AppState) => {
    appStateRef.current = next;
    setAppState(next);
  }, []);

  const applySessions = useCallback((sessions: PomodoroSession[]) => {
    const current = appStateRef.current;
    const tags = unionTags(current?.tags ?? [], sessions);
    const currentTag =
      current?.currentTag && tags.includes(current.currentTag) ? current.currentTag : undefined;
    commit({ sessions, tags, currentTag });
  }, [commit]);

  const runSync = useCallback(() => {
    return scheduleSync(() => appStateRef.current?.sessions ?? [], applySessions).then(
      () => undefined,
      (error: unknown) => {
        console.warn("[sync] failed", error);
      },
    );
  }, [applySessions]);

  const onFocusDone = useCallback(
    (plannedSeconds: number, tag?: string) => {
      const current = appStateRef.current;
      if (!current) {
        console.warn("[tomato-clock] focus complete skipped: app state not ready");
        return;
      }
      const now = new Date();
      const session: PomodoroSession = {
        id: crypto.randomUUID(),
        startDate: new Date(now.getTime() - plannedSeconds * 1000).toISOString(),
        endDate: now.toISOString(),
        plannedSeconds,
      };
      if (tag) {
        session.tag = tag;
        session.tagAt = now.getTime();
      }
      const next = addSession(current, session);
      commit({ ...next, tags: unionTags(next.tags, [session]) });
      const label = tag ?? "未分类";
      notify("番茄完成", `已记到${label}`);
      playBeep();
      setToast({ message: "番茄完成！", sub: `已记到${label}` });
      void runSync();
    },
    [commit, notify, playBeep, runSync],
  );

  const focus = useWallClock(FOCUS_TIMER_KEY, FOCUS_SECONDS, onFocusDone);

  const go = useCallback((next: "home" | "config") => {
    const hash = next === "config" ? "#/config" : "";
    const nextUrl = window.location.pathname + window.location.search + hash;
    const current = window.location.pathname + window.location.search + window.location.hash;
    if (current !== nextUrl) history.pushState(null, "", nextUrl);
    setPage(next);
  }, []);

  useEffect(() => {
    const syncPage = () => setPage(readPage());
    window.addEventListener("hashchange", syncPage);
    window.addEventListener("popstate", syncPage);
    return () => {
      window.removeEventListener("hashchange", syncPage);
      window.removeEventListener("popstate", syncPage);
    };
  }, []);

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
        const tag = appStateRef.current.currentTag;
        if (!tag) {
          setToast({ message: "先选一个标签" });
          return;
        }
        requestPermission();
        clock.start(tag);
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
  useKeyboardShortcut(" ", handleSpace, page === "home");

  if (page === "config") {
    return (
      <>
        <ConfigPage
          tags={appState.tags}
          sessions={appState.sessions}
          onAdd={(name) => commit(addTag(appStateRef.current, name))}
          onRemove={(tag) => {
            try {
              commit(removeTag(appStateRef.current, tag));
            } catch (error) {
              setToast({ message: error instanceof Error ? error.message : "删不掉" });
            }
          }}
          onBack={() => go("home")}
          onError={(message) => setToast({ message })}
        />
        {toast && <Toast message={toast.message} sub={toast.sub} onDismiss={() => setToast(null)} />}
      </>
    );
  }

  return (
    <div className="stage">
      <div className="phone">
        <button className="btn nav" type="button" onClick={() => go("config")}>
          配置
        </button>
        <ClockScreen
          title={TITLE}
          cat={asset("art/cat-timer.webp")}
          seconds={focus.timer.remainingSeconds}
          total={focus.timer.totalSeconds}
          action={actionText(focus.timer.mode)}
          actionLabel={actionLabel(focus.timer.mode, "专注")}
          actionClass={actionClass(focus.timer.mode, Boolean(appState.currentTag))}
          onAction={() => press(focus)}
        >
          <TagPick
            tags={appState.tags}
            current={appState.currentTag}
            locked={focus.timer.mode === "idle" ? undefined : focus.timer.tag || "未分类"}
            onSelect={(tag) => commit(selectTag(appStateRef.current, tag))}
            onConfig={() => go("config")}
          />
        </ClockScreen>
        {toast && (
          <Toast
            message={toast.message}
            sub={toast.sub}
            onDismiss={() => setToast(null)}
          />
        )}
      </div>
      <SideBoard
        sessions={appState.sessions}
        tags={appState.tags}
        onRetag={(id, tag) => {
          try {
            commit(setSessionTag(appStateRef.current, id, tag));
            void runSync();
          } catch (error) {
            setToast({ message: error instanceof Error ? error.message : "改不了分类" });
          }
        }}
      />
    </div>
  );
}

function actionText(mode: "idle" | "focusing" | "paused"): string {
  if (mode === "focusing") return "暂停";
  if (mode === "paused") return "继续";
  return "开始";
}

function actionClass(mode: "idle" | "focusing" | "paused", ready: boolean): string {
  if (mode === "focusing") return "go go-run";
  if (mode === "paused") return "go go-pause";
  if (!ready) return "go go-off";
  return "go";
}

function actionLabel(mode: "idle" | "focusing" | "paused", name: string): string {
  if (mode === "focusing") return `暂停${name}`;
  if (mode === "paused") return `继续${name}`;
  return `开始${name}`;
}
