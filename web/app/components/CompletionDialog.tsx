"use client";

import { BreakType, FOCUS_SECONDS } from "@/lib/types";
import { getBreakSeconds } from "@/lib/timer-engine";

interface CompletionDialogProps {
  show: boolean;
  breakType: BreakType;
  onStartBreak: () => void;
  onLater: () => void;
}

export default function CompletionDialog({
  show,
  breakType,
  onStartBreak,
  onLater,
}: CompletionDialogProps) {
  if (!show) return null;

  const breakLabel = breakType === "long" ? "长休息" : "短休息";
  const breakMinutes = getBreakSeconds(breakType) / 60;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4 text-center">
        <div className="text-5xl mb-4">🍅</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">番茄完成!</h3>
        <p className="text-slate-500 text-sm mb-6">
          恭喜完成 {FOCUS_SECONDS / 60} 分钟专注<br />
          建议休息 {breakMinutes} 分钟（{breakLabel}）
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onStartBreak}
            className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
          >
            开始休息
          </button>
          <button
            onClick={onLater}
            className="w-full px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-medium rounded-xl transition-colors text-sm"
          >
            稍后
          </button>
        </div>
      </div>
    </div>
  );
}
