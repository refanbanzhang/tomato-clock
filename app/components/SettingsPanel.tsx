"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/lib/i18n";
import { DataImportError, downloadStateExport, parseImportData } from "@/lib/data-transfer";
import type { AppState } from "@/lib/types";
import AccountSection from "./AccountSection";

interface SettingsPanelProps {
  weeklyTarget: number;
  monthlyTarget: number;
  yearlyTarget: number;
  appState: AppState;
  onSetTarget: (target: number) => void;
  onSetMonthlyTarget: (target: number) => void;
  onSetYearlyTarget: (target: number) => void;
  onImport: (state: AppState) => void;
  onImportError: (message: string) => void;
}

export default function SettingsPanel({
  weeklyTarget,
  monthlyTarget,
  yearlyTarget,
  appState,
  onSetTarget,
  onSetMonthlyTarget,
  onSetYearlyTarget,
  onImport,
  onImportError,
}: SettingsPanelProps) {
  const { t } = useLocale();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(weeklyTarget);
  const [editingMonthly, setEditingMonthly] = useState(false);
  const [monthlyValue, setMonthlyValue] = useState(monthlyTarget);
  const [editingYearly, setEditingYearly] = useState(false);
  const [yearlyValue, setYearlyValue] = useState(yearlyTarget);
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

  const handleMonthlySave = () => {
    const v = Math.max(1, Math.min(9999, monthlyValue));
    onSetMonthlyTarget(v);
    setEditingMonthly(false);
  };

  const handleYearlySave = () => {
    const v = Math.max(1, Math.min(99999, yearlyValue));
    onSetYearlyTarget(v);
    setEditingYearly(false);
  };

  return (
    <div className="p-6">
      <h2
        id="settings-title"
        className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 pr-8"
      >
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

      {/* Monthly target */}
      <div className="flex items-center justify-between gap-4 mt-4">
        <span className="text-sm font-medium text-teal-950 dark:text-slate-200">{t("monthlyTarget")}</span>
        {editingMonthly ? (
          <div className="flex items-center gap-2">
            <label htmlFor="monthly-target" className="sr-only">
              {t("monthlyTargetLabel")}
            </label>
            <input
              id="monthly-target"
              type="number"
              value={monthlyValue}
              onChange={(e) => setMonthlyValue(Number(e.target.value))}
              min={1}
              max={9999}
              className="w-20 px-3 py-1.5 text-sm text-center border border-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleMonthlySave();
                if (e.key === "Escape") {
                  setMonthlyValue(monthlyTarget);
                  setEditingMonthly(false);
                }
              }}
            />
            <button onClick={handleMonthlySave} className="btn btn-primary px-3 py-1.5 text-xs">
              {t("confirm")}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setMonthlyValue(monthlyTarget);
              setEditingMonthly(true);
            }}
            className="flex items-center gap-2 text-sm font-semibold text-teal-950 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            {monthlyTarget} {t("unitPieces")}
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

      {/* Yearly target */}
      <div className="flex items-center justify-between gap-4 mt-4">
        <span className="text-sm font-medium text-teal-950 dark:text-slate-200">{t("yearlyTarget")}</span>
        {editingYearly ? (
          <div className="flex items-center gap-2">
            <label htmlFor="yearly-target" className="sr-only">
              {t("yearlyTargetLabel")}
            </label>
            <input
              id="yearly-target"
              type="number"
              value={yearlyValue}
              onChange={(e) => setYearlyValue(Number(e.target.value))}
              min={1}
              max={99999}
              className="w-20 px-3 py-1.5 text-sm text-center border border-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleYearlySave();
                if (e.key === "Escape") {
                  setYearlyValue(yearlyTarget);
                  setEditingYearly(false);
                }
              }}
            />
            <button onClick={handleYearlySave} className="btn btn-primary px-3 py-1.5 text-xs">
              {t("confirm")}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setYearlyValue(yearlyTarget);
              setEditingYearly(true);
            }}
            className="flex items-center gap-2 text-sm font-semibold text-teal-950 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            {yearlyTarget} {t("unitPieces")}
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
        <div className="data-actions">
          <button onClick={handleExport} className="btn btn-muted py-2 text-sm">
            {t("exportData")}
          </button>
          <button onClick={handleImportClick} className="btn btn-muted py-2 text-sm">
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

      <AccountSection />
    </div>
  );
}
