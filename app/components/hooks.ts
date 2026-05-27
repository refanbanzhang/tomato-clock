"use client";

import { useEffect, useCallback, useState } from "react";

const NOTIFY_ICON = "/icon.svg";

/** 获取 basePath 对应的 sw.js 路径，兼容 output: "export" + basePath 部署 */
function getSwPath(): string {
  if (typeof window === "undefined") return "/sw.js";
  // 从 <head> 中的 <base> 标签或当前路径推断 basePath
  const baseEl = document.querySelector("base");
  if (baseEl?.href) {
    try {
      const u = new URL("sw.js", baseEl.href);
      return u.pathname;
    } catch { /* fall through */ }
  }
  // 兜底：相对于当前路径
  return new URL("sw.js", window.location.href).pathname;
}

export function useNotification() {
  const [secureError, setSecureError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const swPath = getSwPath();
    console.log("[notify] registering service worker at:", swPath);
    navigator.serviceWorker.register(swPath).catch((err) => {
      console.warn("[notify] service worker register failed:", err);
    });
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("[notify] Notification API not available");
      setSecureError("浏览器不支持通知");
      return false;
    }
    // 检查是否在安全上下文中（HTTPS 或 localhost）
    if (!window.isSecureContext) {
      console.warn("[notify] not in secure context, Notification requires HTTPS");
      setSecureError("通知需要 HTTPS 环境，当前为非安全连接");
      return false;
    }
    if (Notification.permission === "granted") {
      setSecureError(null);
      return true;
    }
    if (Notification.permission === "denied") {
      setSecureError("通知权限已被拒绝，请在浏览器设置中重新允许");
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      console.log("[notify] permission result:", result);
      if (result === "granted") {
        setSecureError(null);
        return true;
      }
      setSecureError("通知权限请求被拒绝");
      return false;
    } catch (err) {
      console.error("[notify] permission request failed:", err);
      setSecureError("通知权限请求失败");
      return false;
    }
  }, []);

  const notify = useCallback(async (title: string, body: string): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("[notify] Notification API not available");
      return false;
    }
    if (!window.isSecureContext) {
      console.warn("[notify] not in secure context, cannot send notification");
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

  return { requestPermission, notify, secureError };
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
