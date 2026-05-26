"use client";

import { TimerMode, FOCUS_SECONDS } from "@/lib/types";

interface TimerControlsProps {
  mode: TimerMode;
  remainingSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinishEarly: () => void;
  onAbandon: () => void;
}

export default function TimerControls({
  mode,
  remainingSeconds,
  onStart,
  onPause,
  onResume,
  onFinishEarly,
  onAbandon,
}: TimerControlsProps) {
  if (mode === "idle") {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onStart}
          className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl text-lg transition-colors shadow-lg shadow-red-200"
        >
          开始 {FOCUS_SECONDS / 60} 分钟
        </button>
        <p className="text-xs text-slate-400">
          快捷键: <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[11px]">Space</kbd>
        </p>
      </div>
    );
  }

  if (mode === "focusing") {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={onPause}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl text-sm transition-colors"
        >
          暂停
        </button>
        <button
          onClick={onFinishEarly}
          className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 font-medium rounded-xl text-sm transition-colors"
        >
          提前结束<small className="block text-[10px] opacity-60">不计入</small>
        </button>
        <button
          onClick={onAbandon}
          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-400 font-medium rounded-xl text-sm transition-colors"
        >
          放弃<small className="block text-[10px] opacity-60">不计入</small>
        </button>
      </div>
    );
  }

  // paused
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onResume}
        className="px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors"
      >
        继续
      </button>
      <button
        onClick={onFinishEarly}
        className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 font-medium rounded-xl text-sm transition-colors"
      >
        提前结束
      </button>
      <button
        onClick={onAbandon}
        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-400 font-medium rounded-xl text-sm transition-colors"
      >
        放弃
      </button>
    </div>
  );
}
