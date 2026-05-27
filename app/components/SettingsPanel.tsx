"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/lib/i18n";
import { DataImportError, downloadStateExport, parseImportData } from "@/lib/data-transfer";
import type { AppState } from "@/lib/types";

interface SettingsPanelProps {
  weeklyTarget: number;
  appState: AppState;
  onSetTarget: (target: number) => void;
  onImport: (state: AppState) => void;
  onImportError: (message: string) => void;
  onTestFireworks?: () => void;
}

export default function SettingsPanel({
  weeklyTarget,
  appState,
  onSetTarget,
  onImport,
  onImportError,
  onTestFireworks,
}: SettingsPanelProps) {
  const { t } = useLocale();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(weeklyTarget);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const v = Math.max(1, Math.min(999, value));
    onSetTarget(v);
    setEditing(false);
  };

  const handleExport = () => {
    downloadStateExport(appState);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!window.confirm(t("importConfirm"))) return;

    try {
      const text = await file.text();
      const imported = parseImportData(text);
      onImport(imported);
    } catch (err) {
      if (err instanceof DataImportError) {
        const key =
          err.code === "invalidJson" ? "importErrorInvalidJson" : "importErrorInvalidFormat";
        onImportError(t(key));
        return;
      }
      onImportError(t("importErrorInvalidFormat"));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5">
        {t("settingsTitle")}
      </h2>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-teal-950 dark:text-slate-200">{t("weeklyTarget")}</span>
        {editing ? (
          <div className="flex items-center gap-2">
            <label htmlFor="weekly-target" className="sr-only">
              {t("weeklyTargetLabel")}
            </label>
            <input
              id="weekly-target"
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              min={1}
              max={999}
              className="w-20 px-3 py-1.5 text-sm text-center border border-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              {t("confirm")}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setValue(weeklyTarget);
              setEditing(true);
            }}
            className="flex items-center gap-2 text-sm font-semibold text-teal-950 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            {weeklyTarget} {t("unitPieces")}
            <svg
              className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"
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

      <div className="mt-5 pt-5 border-t border-teal-50 dark:border-slate-700/50">
        <p className="text-sm font-medium text-teal-950 dark:text-slate-200">{t("dataSection")}</p>
        <p className="subtitle mt-1">{t("dataSectionHint")}</p>
        <div className="flex gap-2 mt-3">
          <button onClick={handleExport} className="btn btn-muted flex-1 py-2 text-sm">
            {t("exportData")}
          </button>
          <button onClick={handleImportClick} className="btn btn-muted flex-1 py-2 text-sm">
            {t("importData")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-teal-50 dark:border-slate-700/50">
        <div className="subtitle space-y-1.5">
          <p>{t("focusDuration")}</p>
          <p>
            {t("shortcutStartPause")} <kbd className="kbd">Space</kbd>
          </p>
        </div>
        {onTestFireworks && (
          <button
            type="button"
            onClick={onTestFireworks}
            className="btn btn-muted w-full py-2 text-sm mt-3"
          >
            {t("testFireworks")}
          </button>
        )}
      </div>
    </div>
  );
}
