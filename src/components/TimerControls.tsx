import { TimerMode, FOCUS_SECONDS } from "@/lib/types";

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
  if (mode === "idle") {
    return (
      <p>
        <button type="button" onClick={onStart}>
          开始 {FOCUS_SECONDS / 60} 分钟
        </button>
      </p>
    );
  }

  if (mode === "focusing") {
    return (
      <p>
        <button type="button" onClick={onPause}>
          暂停
        </button>{" "}
        <button type="button" onClick={onAbandon}>
          放弃
        </button>
      </p>
    );
  }

  return (
    <p>
      <button type="button" onClick={onResume}>
        继续
      </button>{" "}
      <button type="button" onClick={onAbandon}>
        放弃
      </button>
    </p>
  );
}
