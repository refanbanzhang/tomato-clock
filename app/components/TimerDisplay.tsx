"use client";

import { formatTime } from "@/lib/timer-engine";
import { TimerMode } from "@/lib/types";

interface TimerDisplayProps {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
}

const modeLabel: Record<TimerMode, string> = {
  idle: "准备开始",
  focusing: "专注中",
  paused: "已暂停",
};

const modeColor: Record<TimerMode, string> = {
  idle: "#cbd5e1",
  focusing: "#0d9488",
  paused: "#f59e0b",
};

export default function TimerDisplay({
  mode,
  remainingSeconds,
  totalSeconds,
}: TimerDisplayProps) {
  const progress = 1 - remainingSeconds / totalSeconds;
  const radius = 118;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const accent = modeColor[mode];

  return (
    <div className="card p-8 flex flex-col items-center">
      <div className="relative flex flex-col items-center justify-center">
        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          className="transform -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="6"
          />
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="timer-ring transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span
            className="text-[3.25rem] font-mono font-bold tabular-nums tracking-tight text-teal-950 leading-none"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatTime(remainingSeconds)}
          </span>
          <span
            className="mt-3 text-sm font-medium px-3 py-1 rounded-full"
            style={{
              backgroundColor: `${accent}18`,
              color: accent,
            }}
          >
            {modeLabel[mode]}
          </span>
        </div>
      </div>
    </div>
  );
}
