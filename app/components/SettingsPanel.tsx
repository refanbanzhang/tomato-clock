"use client";

import { useState } from "react";

interface SettingsPanelProps {
  weeklyTarget: number;
  onSetTarget: (target: number) => void;
}

export default function SettingsPanel({ weeklyTarget, onSetTarget }: SettingsPanelProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(weeklyTarget);

  const handleSave = () => {
    const v = Math.max(1, Math.min(999, value));
    onSetTarget(v);
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
        设置
      </h2>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">周目标</span>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              min={1}
              max={999}
              className="w-20 px-3 py-1.5 text-sm text-center border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setValue(weeklyTarget);
                  setEditing(false);
                }
              }}
            />
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              确定
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setValue(weeklyTarget);
              setEditing(true);
            }}
            className="flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-red-500 transition-colors"
          >
            {weeklyTarget} 个
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-400 space-y-1">
          <p>🍅 专注: 25 分钟</p>
          <p>快捷键 <kbd className="px-1 py-0.5 bg-slate-100 rounded font-mono">Space</kbd> 开始/暂停</p>
        </div>
      </div>
    </div>
  );
}
