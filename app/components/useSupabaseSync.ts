"use client";

import { useEffect, useRef, useCallback } from "react";
import { AppState } from "@/lib/types";
import { fetchRemoteState, uploadState } from "@/lib/supabase-sync";

interface SyncCallbacks {
  onRemoteState: (state: AppState) => void;
  getCurrentState: () => AppState;
}

/**
 * Sync local state with Supabase remote.
 * - On mount: fetch remote, merge if newer (via lastUploadedAt tracking)
 * - On local change (via triggerUpload): debounced upload after 500ms
 * - On cross-tab storage event: re-fetch from remote
 */
export function useSupabaseSync({ onRemoteState, getCurrentState }: SyncCallbacks) {
  const lastUploadedAt = useRef<Date>(new Date(0));
  const uploadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncing = useRef(false);
  const initialSyncDone = useRef(false);

  // Pull from remote
  const syncFromRemote = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    try {
      const remote = await fetchRemoteState();
      if (remote && remote.updatedAt > lastUploadedAt.current) {
        onRemoteState(remote.state);
        lastUploadedAt.current = remote.updatedAt;
      }
    } catch (e) {
      console.warn("Supabase pull failed:", e);
    } finally {
      isSyncing.current = false;
    }
  }, [onRemoteState]);

  // Push to remote (debounced)
  const triggerUpload = useCallback(() => {
    if (uploadTimer.current) clearTimeout(uploadTimer.current);
    uploadTimer.current = setTimeout(async () => {
      const now = new Date();
      try {
        await uploadState(getCurrentState(), now);
        lastUploadedAt.current = now;
      } catch (e) {
        console.warn("Supabase upload failed:", e);
      }
    }, 500);
  }, [getCurrentState]);

  // Initial sync on mount
  useEffect(() => {
    if (initialSyncDone.current) return;
    initialSyncDone.current = true;
    syncFromRemote();
  }, [syncFromRemote]);

  // Cross-tab sync: when another tab writes to localStorage, re-fetch from remote
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "tomato-clock-state" && e.newValue) {
        syncFromRemote();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [syncFromRemote]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (uploadTimer.current) clearTimeout(uploadTimer.current);
    };
  }, []);

  return { triggerUpload, syncFromRemote };
}
