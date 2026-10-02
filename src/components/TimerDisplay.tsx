import { formatTime } from "@/lib/timer-engine";
import { TimerMode } from "@/lib/types";

interface TimerDisplayProps {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
}

export default function TimerDisplay({
  mode,
  remainingSeconds,
  totalSeconds,
}: TimerDisplayProps) {
  const modeLabel: Record<TimerMode, string> = {
    idle: "准备开始",
    focusing: "专注中",
    paused: "已暂停",
  };

  return (
    <div>
      <p aria-live="polite" aria-atomic="true">
        {formatTime(remainingSeconds)}
      </p>
      <p>{modeLabel[mode]}</p>
      <progress
        value={totalSeconds - remainingSeconds}
        max={totalSeconds}
        aria-label={modeLabel[mode]}
      />
    </div>
  );
}
