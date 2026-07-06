
import { formatTime } from "@/lib/timer-engine";
import { TimerMode } from "@/lib/types";
import { useLocale } from "@/lib/i18n";

interface TimerDisplayProps {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
}

const modeClass: Record<TimerMode, { ring: string; tag: string }> = {
  idle: { ring: "timer-ring-idle", tag: "timer-tag-idle" },
  focusing: { ring: "timer-ring-focus", tag: "timer-tag-focus" },
  paused: { ring: "timer-ring-pause", tag: "timer-tag-pause" },
};

export default function TimerDisplay({
  mode,
  remainingSeconds,
  totalSeconds,
}: TimerDisplayProps) {
  const { t } = useLocale();
  const modeLabel: Record<TimerMode, string> = {
    idle: t("readyToStart"),
    focusing: t("focusing"),
    paused: t("paused"),
  };
  const progress = 1 - remainingSeconds / totalSeconds;
  const radius = 118;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="timer-ring-wrap">
      <svg
        width="280"
        height="280"
        viewBox="0 0 280 280"
        className="timer-svg"
        aria-hidden="true"
      >
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          strokeWidth="5"
          className="timer-track"
        />
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`timer-ring ${modeClass[mode].ring}`}
        />
      </svg>

      <div className="timer-readout">
        <span className="timer-num" aria-live="polite" aria-atomic="true">
          {formatTime(remainingSeconds)}
        </span>
        <span className={`timer-tag ${modeClass[mode].tag}`}>
          {modeLabel[mode]}
        </span>
      </div>
    </div>
  );
}
