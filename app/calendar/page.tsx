"use client";

import { useState, useEffect } from "react";
import AppNav from "../components/AppNav";
import CalendarView from "../components/CalendarView";
import StatsSummary from "../components/StatsSummary";
import { loadState, saveState } from "@/lib/store";
import { fetchRemoteState } from "@/lib/supabase-sync";
import type { AppState } from "@/lib/types";

export default function CalendarPage() {
  const [appState, setAppState] = useState<AppState | null>(null);

  useEffect(() => {
    const local = loadState();
    setAppState(local);

    fetchRemoteState()
      .then((remote) => {
        if (remote) {
          saveState(remote.state);
          setAppState(remote.state);
        }
      })
      .catch((e) => {
        console.warn("Supabase pull failed on calendar page:", e);
      });
  }, []);

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
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchRemoteState()
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
  }, []);

  if (!appState) {
    return (
      <div className="page items-center justify-center">
        <div className="loader" role="status" aria-label="加载中" />
      </div>
    );
  }

  return (
    <div className="page">
      <AppNav />

      <header className="page-inner mb-6 text-center">
        <h1 className="title">专注日历</h1>
        <p className="subtitle mt-1.5">追踪每日番茄完成情况</p>
      </header>

      <main className="page-inner w-full">
        <StatsSummary
          sessions={appState.sessions}
          weeklyTarget={appState.weeklyTarget}
        />

        <CalendarView sessions={appState.sessions} />
      </main>

      <footer className="footer">Tomato Clock v0.1.0</footer>
    </div>
  );
}
