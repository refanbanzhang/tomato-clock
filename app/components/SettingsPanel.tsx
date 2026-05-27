"use client";

import { useState } from "react";

interface SettingsPanelProps {
  weeklyTarget: number;
  onSetTarget: (target: number) => void;
  onClearData?: () => void;
  onClearAll?: () => void;
}

export default function SettingsPanel({ weeklyTarget, onSetTarget, onClearData, onClearAll }: SettingsPanelProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(weeklyTarget);

  const handleSave = () => {
    const v = Math.max(1, Math.min(999, value));
    onSetTarget(v);
    setEditing(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-5">
        设置
      </h2>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-teal-950">周目标</span>
        {editing ? (
          <div className="flex items-center gap-2">
            <label htmlFor="weekly-target" className="sr-only">
              周目标数量
            </label>
            <input
              id="weekly-target"
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              min={1}
              max={999}
              className="w-20 px-3 py-1.5 text-sm text-center border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setValue(weeklyTarget);
                  setEditing(false);
                }
              }}
            />
            <button onClick={handleSave} className="btn btn-primary px-3 py-1.5 text-xs">
              确定
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setValue(weeklyTarget);
              setEditing(true);
            }}
            className="flex items-center gap-2 text-sm font-semibold text-teal-950 hover:text-teal-600 transition-colors cursor-pointer"
          >
            {weeklyTarget} 个
            <svg
              className="w-3.5 h-3.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-5 pt-5 border-t border-teal-50">
        <div className="subtitle space-y-1.5">
          <p>专注时长 25 分钟</p>
          <p>
            快捷键 <kbd className="kbd">Space</kbd> 开始 / 暂停
          </p>
        </div>
        {onClearData && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={onClearData}
              className="flex-1 py-2 text-xs text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            >
              清除今天
            </button>
            {onClearAll && (
              <button
                onClick={onClearAll}
                className="flex-1 py-2 text-xs text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                清除所有
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
