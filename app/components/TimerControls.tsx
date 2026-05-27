"use client";

import { TimerMode, FOCUS_SECONDS } from "@/lib/types";
import { useLocale } from "@/lib/i18n";

interface TimerControlsProps {
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinishEarly: () => void;
  onAbandon: () => void;
}

export default function TimerControls({
  mode,
  onStart,
  onPause,
  onResume,
  onFinishEarly,
  onAbandon,
}: TimerControlsProps) {
  const { t } = useLocale();

  if (mode === "idle") {
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <button onClick={onStart} className="btn btn-cta w-full max-w-xs">
          {t("startFocus", { minutes: FOCUS_SECONDS / 60 })}
        </button>
        <p className="subtitle">
          {t("shortcut")} <kbd className="kbd">Space</kbd>
        </p>
      </div>
    );
  }

  if (mode === "focusing") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 w-full">
        <button onClick={onPause} className="btn btn-warn">
          {t("pause")}
        </button>
        <button onClick={onFinishEarly} className="btn btn-muted">
          {t("finishEarly")}
          <span className="block text-[10px] font-normal opacity-70">{t("notCounted")}</span>
        </button>
          <button onClick={onAbandon} className="btn btn-ghost">
            {t("giveUp")}
            <span className="block text-[10px] font-normal opacity-70">{t("notCounted")}</span>
          </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 w-full">
      <button onClick={onResume} className="btn btn-cta">
        {t("resume")}
      </button>
      <button onClick={onFinishEarly} className="btn btn-muted">
        {t("finishEarly")}
      </button>
      <button onClick={onAbandon} className="btn btn-ghost">
        {t("giveUp")}
      </button>
    </div>
  );
}
