"use client";

import { ProgressSnapshot, StatsMode } from "@/lib/types";
import ProgressBar from "./ProgressBar";

interface StatsPanelProps {
  progress: ProgressSnapshot;
  statsMode: StatsMode;
  onStatsModeChange: (mode: StatsMode) => void;
}

export default function StatsPanel({ progress, statsMode, onStatsModeChange }: StatsPanelProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
        本周进度
      </h2>

      <ProgressBar
        completed={progress.completed}
        target={progress.target}
        percent={progress.percent}
      />

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-xs text-slate-400 mb-1">今日完成</div>
          <div className="text-xl font-bold text-slate-800">{progress.todayCompleted}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-xs text-slate-400 mb-1">上周同期</div>
          <div className="text-xl font-bold text-slate-800">{progress.lastWeekCompleted}</div>
        </div>
      </div>

      {/* 7-day bar chart */}
      <div className="mt-5">
        <div className="flex items-end justify-between gap-1 h-24 px-1">
          {progress.dailyCounts.map((day, i) => {
            const maxCount = Math.max(...progress.dailyCounts.map((d) => d.count), 1);
            const height = (day.count / maxCount) * 100;
            const isToday = i === progress.dailyCounts.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-500">{day.count}</span>
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isToday ? "bg-red-500" : "bg-red-300"
                  }`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className={`text-[10px] mt-1 ${isToday ? "text-red-500 font-semibold" : "text-slate-400"}`}>
                  {day.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats mode toggle */}
      <div className="mt-5 flex items-center gap-2">
        <span className="text-xs text-slate-400">统计模式</span>
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => onStatsModeChange("calendarWeek")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              statsMode === "calendarWeek"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            每周一重置
          </button>
          <button
            onClick={() => onStatsModeChange("rollingSevenDays")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              statsMode === "rollingSevenDays"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            滚动 7 天
          </button>
        </div>
      </div>
    </div>
  );
}
