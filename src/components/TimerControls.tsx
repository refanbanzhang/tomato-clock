import { TimerMode, FOCUS_SECONDS } from "@/lib/types";
import { useLocale } from "@/lib/i18n";

interface TimerControlsProps {
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onAbandon: () => void;
}

export default function TimerControls({
  mode,
  onStart,
  onPause,
  onResume,
  onAbandon,
}: TimerControlsProps) {
  const { t } = useLocale();

  if (mode === "idle") {
    return (
      <div className="focus-ctrl">
        <button onClick={onStart} className="btn btn-cta btn-lg w-full">
          {t("startFocus", { minutes: FOCUS_SECONDS / 60 })}
        </button>
      </div>
    );
  }

  if (mode === "focusing") {
    return (
      <div className="focus-ctrl">
        <button onClick={onPause} className="btn btn-warn btn-lg w-full">
          {t("pause")}
        </button>
        <button onClick={onAbandon} className="btn btn-link w-full">
          {t("giveUp")}
        </button>
      </div>
    );
  }

  return (
    <div className="focus-ctrl">
      <button onClick={onResume} className="btn btn-cta btn-lg w-full">
        {t("resume")}
      </button>
      <button onClick={onAbandon} className="btn btn-link w-full">
        {t("giveUp")}
      </button>
    </div>
  );
}
