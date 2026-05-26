"use client";

import { formatTime } from "@/lib/timer-engine";
import { TimerMode } from "@/lib/types";

interface TimerDisplayProps {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
}

export default function TimerDisplay({ mode, remainingSeconds, totalSeconds }: TimerDisplayProps) {
  const progress = 1 - remainingSeconds / totalSeconds;
  const circumference = 2 * Math.PI * 130;
  const strokeDashoffset = circumference * (1 - progress);

  const modeLabel: Record<TimerMode, string> = {
    idle: "准备开始",
    focusing: "专注中",
    paused: "已暂停",
    resting: "休息中",
  };

  const modeColor: Record<TimerMode, string> = {
    idle: "#e2e8f0",
    focusing: "#ef4444",
    paused: "#f59e0b",
    resting: "#22c55e",
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        className="transform -rotate-90"
      >
        <circle
          cx="150"
          cy="150"
          r="130"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="8"
        />
        <circle
          cx="150"
          cy="150"
          r="130"
          fill="none"
          stroke={modeColor[mode]}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-6xl font-mono font-bold tabular-nums tracking-tight text-slate-800">
          {formatTime(remainingSeconds)}
        </span>
        <span
          className="mt-2 text-sm font-medium px-3 py-1 rounded-full"
          style={{
            backgroundColor: modeColor[mode] + "20",
            color: modeColor[mode],
          }}
        >
          {modeLabel[mode]}
        </span>
      </div>
    </div>
  );
}
