"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  sub?: string;
  duration?: number;
  onDismiss: () => void;
}

export default function Toast({
  message,
  sub,
  duration = 5000,
  onDismiss,
}: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // 入场动画
    requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className="toast-overlay"
      onClick={() => {
        setExiting(true);
        setTimeout(onDismiss, 300);
      }}
    >
      <div
        className={`toast-card ${visible ? "toast-enter" : ""} ${exiting ? "toast-exit" : ""}`}
        role="alert"
      >
        <div className="flex items-center gap-2.5">
          <span className="toast-icon">🍅</span>
          <div>
            <p className="toast-message">{message}</p>
            {sub && <p className="toast-sub">{sub}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
