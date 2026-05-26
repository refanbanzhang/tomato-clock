"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import CalendarView from "../components/CalendarView";
import { loadState, saveState } from "@/lib/store";
import { fetchRemoteState } from "@/lib/supabase-sync";
import type { AppState } from "@/lib/types";

export default function CalendarPage() {
  const [appState, setAppState] = useState<AppState | null>(null);

  useEffect(() => {
    const local = loadState();
    setAppState(local);

    // Pull from Supabase, merge if newer
    fetchRemoteState()
      .then((remote) => {
        if (remote) {
          // Merge: remote wins (it's the source of truth from the macOS app)
          saveState(remote.state);
          setAppState(remote.state);
        }
      })
      .catch((e) => {
        console.warn("Supabase pull failed on calendar page:", e);
      });
  }, []);

  // Listen for cross-tab/localStorage changes
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

  // Re-fetch on tab visibility change
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
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-slate-400 text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center py-8 px-4">
      {/* Navigation */}
      <nav className="w-full max-w-md mb-8">
        <div className="flex rounded-xl bg-white border border-stone-200 p-1 shadow-sm">
          <Link
            href="/"
            className="flex-1 text-center py-2 text-sm font-medium rounded-lg text-slate-500 hover:text-slate-700 hover:bg-stone-50 transition-colors"
          >
            计时器
          </Link>
          <Link
            href="/calendar"
            className="flex-1 text-center py-2 text-sm font-medium rounded-lg bg-stone-800 text-white shadow-sm"
          >
            日历
          </Link>
        </div>
      </nav>

      {/* Calendar */}
      <CalendarView sessions={appState.sessions} />

      {/* Footer */}
      <footer className="mt-12 mb-4 text-xs text-slate-300">
        Tomato Clock v0.1.0
      </footer>
    </div>
  );
}
