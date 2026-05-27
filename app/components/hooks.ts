"use client";

import { useEffect, useCallback } from "react";

const NOTIFY_ICON = "/icon.svg";

export function useNotification() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("[notify] service worker register failed:", err);
    });
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("[notify] Notification API not available");
      return false;
    }
    if (Notification.permission === "granted") return true;
    try {
      const result = await Notification.requestPermission();
      console.log("[notify] permission result:", result);
      return result === "granted";
    } catch (err) {
      console.error("[notify] permission request failed:", err);
      return false;
    }
  }, []);

  const notify = useCallback(async (title: string, body: string): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("[notify] Notification API not available");
      return false;
    }
    if (Notification.permission !== "granted") {
      console.log("[notify] permission not granted, current:", Notification.permission);
      return false;
    }

    const options: NotificationOptions = {
      body,
      icon: NOTIFY_ICON,
      tag: "tomato-complete",
      requireInteraction: true,
    };

    // 优先通过 Service Worker 发送（后台标签页也能弹出）
    if ("serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, options);
        console.log("[notify] sent via service worker");
        return true;
      } catch (err) {
        console.warn("[notify] service worker failed, trying fallback:", err);
      }
    }

    // 降级：直接 new Notification
    try {
      new Notification(title, options);
      console.log("[notify] sent via new Notification()");
      return true;
    } catch (err) {
      console.error("[notify] all notification methods failed:", err);
      return false;
    }
  }, []);

  return { requestPermission, notify };
}

export function useAudio() {
  const playBeep = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        osc2.connect(gain);
        osc2.frequency.value = 1000;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.15);
      }, 200);
    } catch {
      // audio not supported
    }
  }, []);

  return { playBeep };
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === key && !e.ctrlKey && !e.metaKey && !e.altKey && e.target === document.body) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, enabled]);
}
