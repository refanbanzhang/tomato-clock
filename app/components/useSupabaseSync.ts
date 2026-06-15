"use client";

import { useEffect, useRef, useCallback } from "react";
import { AppState } from "@/lib/types";
import { stateStorageKey } from "@/lib/store";
import {
  countLocalOnlySessions,
  fetchRemoteState,
  mergeAppStates,
  uploadState,
  type SyncAuth,
} from "@/lib/supabase-sync";

export type SyncErrorType = "upload" | "pull";

interface SyncCallbacks {
  auth: SyncAuth | null;
  localReady: boolean;
  onRemoteState: (state: AppState) => void;
  getCurrentState: () => AppState;
  onSyncError?: (type: SyncErrorType) => void;
}

const ERROR_TOAST_COOLDOWN_MS = 8000;

export function useSupabaseSync({
  auth,
  localReady,
  onRemoteState,
  getCurrentState,
  onSyncError,
}: SyncCallbacks) {
  const lastUploadedAt = useRef<Date>(new Date(0));
  const uploadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncing = useRef(false);
  const initialSyncDone = useRef(false);
  const lastErrorToastAt = useRef<Record<SyncErrorType, number>>({
    upload: 0,
    pull: 0,
  });
  const authKey = auth ? `${auth.syncId}:${auth.accessToken.slice(0, 8)}` : null;

  const notifySyncError = useCallback(
    (type: SyncErrorType) => {
      if (!onSyncError) return;
      const now = Date.now();
      if (now - lastErrorToastAt.current[type] < ERROR_TOAST_COOLDOWN_MS) return;
      lastErrorToastAt.current[type] = now;
      onSyncError(type);
    },
    [onSyncError]
  );

  const runUpload = useCallback(
    async (reason: string): Promise<boolean> => {
      if (!auth) return false;
      const state = getCurrentState();
      const now = new Date();
      try {
        await uploadState(auth, state, now);
        lastUploadedAt.current = now;
        console.info("[sync] upload ok", {
          reason,
          sessionCount: state.sessions.length,
        });
        return true;
      } catch (e) {
        console.warn("[sync] upload failed", { reason, error: e });
        notifySyncError("upload");
        return false;
      }
    },
    [auth, getCurrentState, notifySyncError]
  );

  const syncFromRemote = useCallback(async () => {
    if (!auth || isSyncing.current) return;
    isSyncing.current = true;
    try {
      const local = getCurrentState();
      const remote = await fetchRemoteState(auth);

      if (!remote) {
        console.info("[sync] pull: no remote row, uploading local", {
          sessionCount: local.sessions.length,
        });
        if (local.sessions.length > 0) {
          await runUpload("initial-empty-remote");
        }
        return;
      }

      const merged = mergeAppStates(local, remote.state);
      const localOnlyCount = countLocalOnlySessions(local, remote.state);
      const needsUpload =
        merged.sessions.length > remote.state.sessions.length || localOnlyCount > 0;

      console.info("[sync] pull merge", {
        localCount: local.sessions.length,
        remoteCount: remote.state.sessions.length,
        mergedCount: merged.sessions.length,
        localOnlyCount,
        remoteUpdatedAt: remote.updatedAt.toISOString(),
        needsUpload,
      });

      onRemoteState(merged);

      if (needsUpload) {
        await runUpload("pull-merge-local-newer");
      } else {
        lastUploadedAt.current = remote.updatedAt;
      }
    } catch (e) {
      console.warn("[sync] pull failed:", e);
      notifySyncError("pull");
    } finally {
      isSyncing.current = false;
    }
  }, [auth, getCurrentState, onRemoteState, runUpload, notifySyncError]);

  const triggerUpload = useCallback(() => {
    if (!auth) return;
    if (uploadTimer.current) clearTimeout(uploadTimer.current);
    uploadTimer.current = setTimeout(() => {
      void runUpload("state-change");
    }, 500);
  }, [auth, runUpload]);

  const flushUpload = useCallback(() => {
    if (!auth) return;
    if (uploadTimer.current) {
      clearTimeout(uploadTimer.current);
      uploadTimer.current = null;
    }
    void runUpload("pagehide-flush");
  }, [auth, runUpload]);

  useEffect(() => {
    initialSyncDone.current = false;
    lastUploadedAt.current = new Date(0);
    lastErrorToastAt.current = { upload: 0, pull: 0 };
  }, [authKey]);

  useEffect(() => {
    if (!auth || !localReady || initialSyncDone.current) return;
    initialSyncDone.current = true;
    void syncFromRemote();
  }, [auth, authKey, localReady, syncFromRemote]);

  useEffect(() => {
    if (!auth) return;
    const key = stateStorageKey(auth.syncId);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        void syncFromRemote();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [auth, syncFromRemote]);

  useEffect(() => {
    if (!auth) return;
    window.addEventListener("pagehide", flushUpload);
    return () => window.removeEventListener("pagehide", flushUpload);
  }, [auth, flushUpload]);

  useEffect(() => {
    return () => {
      if (uploadTimer.current) clearTimeout(uploadTimer.current);
    };
  }, []);

  return { triggerUpload, syncFromRemote };
}
