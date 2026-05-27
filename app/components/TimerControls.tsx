"use client";

import { TimerMode, FOCUS_SECONDS } from "@/lib/types";

interface TimerControlsProps {
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinishEarly: () => void;
  onAbandon: () => void;
  onTestComplete?: () => void;
}

export default function TimerControls({
  mode,
  onStart,
  onPause,
  onResume,
  onFinishEarly,
  onAbandon,
  onTestComplete,
}: TimerControlsProps) {
  if (mode === "idle") {
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <button onClick={onStart} className="btn btn-cta w-full max-w-xs">
          开始 {FOCUS_SECONDS / 60} 分钟
        </button>
        <p className="subtitle">
          快捷键 <kbd className="kbd">Space</kbd>
        </p>
      </div>
    );
  }

  if (mode === "focusing") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 w-full">
        <button onClick={onPause} className="btn btn-warn">
          暂停
        </button>
        <button onClick={onFinishEarly} className="btn btn-muted">
          提前结束
          <span className="block text-[10px] font-normal opacity-70">不计入</span>
        </button>
        <button onClick={onAbandon} className="btn btn-ghost">
          放弃
          <span className="block text-[10px] font-normal opacity-70">不计入</span>
        </button>
        {onTestComplete && (
          <button onClick={onTestComplete} className="btn btn-ghost text-teal-500 text-xs">
            测试完成
            <span className="block text-[10px] font-normal opacity-70">不计入·通知</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 w-full">
      <button onClick={onResume} className="btn btn-cta">
        继续
      </button>
      <button onClick={onFinishEarly} className="btn btn-muted">
        提前结束
      </button>
      <button onClick={onAbandon} className="btn btn-ghost">
        放弃
      </button>
    </div>
  );
}
