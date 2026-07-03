
import { formatTime } from "@/lib/timer-engine";
import { TimerMode } from "@/lib/types";
import { useLocale } from "@/lib/i18n";

interface TimerDisplayProps {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
}

const modeColor: Record<TimerMode, string> = {
  idle: "#c3b7a6",
  focusing: "#d9542f",
  paused: "#d98324",
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
  const accent = modeColor[mode];

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
          stroke="#e6dccd"
          strokeWidth="4"
          className="dark:hidden"
        />
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke="#3a322b"
          strokeWidth="4"
          className="hidden dark:block"
        />
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="timer-ring"
        />
      </svg>

      <div className="timer-readout">
        <span className="timer-num" aria-live="polite" aria-atomic="true">
          {formatTime(remainingSeconds)}
        </span>
        <span
          className="timer-tag"
          style={{
            backgroundColor: `${accent}18`,
            color: accent,
          }}
        >
          {modeLabel[mode]}
        </span>
      </div>
    </div>
  );
}
