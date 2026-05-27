"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface WeeklyCompleteModalProps {
  title: string;
  message: string;
  buttonLabel: string;
  onClose: () => void;
}

export default function WeeklyCompleteModal({
  title,
  message,
  buttonLabel,
  onClose,
}: WeeklyCompleteModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="modal-backdrop celebrate-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal card celebrate-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="weekly-complete-title"
      >
        <div className="celebrate-body">
          <div className="celebrate-icon" aria-hidden="true">
            🎉
          </div>
          <h2 id="weekly-complete-title" className="celebrate-title">
            {title}
          </h2>
          <p className="celebrate-msg">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary w-full py-2.5 text-sm celebrate-btn"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
