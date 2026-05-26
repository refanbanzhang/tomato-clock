"use client";

interface ProgressBarProps {
  completed: number;
  target: number;
  percent: number;
}

export default function ProgressBar({ completed, target, percent }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-2">
        <div>
          <span className="text-3xl font-bold text-slate-800">{completed}</span>
          <span className="text-slate-400 text-lg"> / {target}</span>
        </div>
        <span className="text-2xl font-bold text-red-500">{percent}%</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
