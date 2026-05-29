"use client";

import { useState, useEffect } from "react";
import AppNav from "../components/AppNav";
import CalendarView from "../components/CalendarView";
import StatsSummary from "../components/StatsSummary";
import PageTools from "../components/PageTools";
import { loadState, saveState } from "@/lib/store";
import { fetchRemoteState, createSyncAuth } from "@/lib/supabase-sync";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/i18n";
import type { AppState } from "@/lib/types";

export default function CalendarPage() {
  const { t } = useLocale();
  const { session } = useAuth();
  const [appState, setAppState] = useState<AppState | null>(null);

  useEffect(() => {
    const local = loadState();
    setAppState(local);

    if (!session) return;

    const auth = createSyncAuth(session.user.id, session.access_token);
    fetchRemoteState(auth)
      .then((remote) => {
        if (remote) {
          saveState(remote.state);
          setAppState(remote.state);
        }
      })
      .catch((e) => {
        console.warn("Supabase pull failed on calendar page:", e);
      });
  }, [session]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "tomato-clock-state" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setAppState(parsed);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!session) return;

    const auth = createSyncAuth(session.user.id, session.access_token);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchRemoteState(auth)
          .then((remote) => {
            if (remote) {
              saveState(remote.state);
              setAppState(remote.state);
            }
          })
          .catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [session]);

  if (!appState) {
    return (
      <div className="page items-center justify-center">
        <div className="loader" role="status" aria-label={t("loading")} />
      </div>
    );
  }

  return (
    <div className="page">
      <PageTools />

      <AppNav />

      <header className="page-inner mb-6 text-center">
        <h1 className="title">{t("calendarTitle")}</h1>
        <p className="subtitle mt-1.5">{t("calendarSubtitle")}</p>
      </header>

      <main className="page-inner w-full">
        <StatsSummary
          sessions={appState.sessions}
          weeklyTarget={appState.weeklyTarget}
        />

        <CalendarView sessions={appState.sessions} />
      </main>

      <footer className="footer">{t("footer")}</footer>
    </div>
  );
}
