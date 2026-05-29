"use client";

import { useEffect, useRef, useCallback } from "react";
import { AppState } from "@/lib/types";
import { stateStorageKey } from "@/lib/store";
import { fetchRemoteState, uploadState, type SyncAuth } from "@/lib/supabase-sync";

interface SyncCallbacks {
  auth: SyncAuth | null;
  onRemoteState: (state: AppState) => void;
  getCurrentState: () => AppState;
}

export function useSupabaseSync({ auth, onRemoteState, getCurrentState }: SyncCallbacks) {
  const lastUploadedAt = useRef<Date>(new Date(0));
  const uploadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncing = useRef(false);
  const initialSyncDone = useRef(false);
  const authKey = auth ? `${auth.syncId}:${auth.accessToken.slice(0, 8)}` : null;

  const syncFromRemote = useCallback(async () => {
    if (!auth || isSyncing.current) return;
    isSyncing.current = true;
    try {
      const remote = await fetchRemoteState(auth);
      if (remote && remote.updatedAt > lastUploadedAt.current) {
        onRemoteState(remote.state);
        lastUploadedAt.current = remote.updatedAt;
      } else if (!remote) {
        const now = new Date();
        await uploadState(auth, getCurrentState(), now);
        lastUploadedAt.current = now;
      }
    } catch (e) {
      console.warn("Supabase pull failed:", e);
    } finally {
      isSyncing.current = false;
    }
  }, [auth, onRemoteState]);

  const triggerUpload = useCallback(() => {
    if (!auth) return;
    if (uploadTimer.current) clearTimeout(uploadTimer.current);
    uploadTimer.current = setTimeout(async () => {
      const now = new Date();
      try {
        await uploadState(auth, getCurrentState(), now);
        lastUploadedAt.current = now;
      } catch (e) {
        console.warn("Supabase upload failed:", e);
      }
    }, 500);
  }, [auth, getCurrentState]);

  useEffect(() => {
    initialSyncDone.current = false;
    lastUploadedAt.current = new Date(0);
  }, [authKey]);

  useEffect(() => {
    if (!auth || initialSyncDone.current) return;
    initialSyncDone.current = true;
    syncFromRemote();
  }, [auth, authKey, syncFromRemote]);

  useEffect(() => {
    if (!auth) return;
    const key = stateStorageKey(auth.syncId);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        syncFromRemote();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [auth, syncFromRemote]);

  useEffect(() => {
    return () => {
      if (uploadTimer.current) clearTimeout(uploadTimer.current);
    };
  }, []);

  return { triggerUpload, syncFromRemote };
}
