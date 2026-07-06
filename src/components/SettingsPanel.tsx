
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

interface TargetRowProps {
  id: string;
  label: string;
  ariaLabel: string;
  target: number;
  max: number;
  unit: string;
  confirmLabel: string;
  onSave: (target: number) => void;
}

function TargetRow({
  id,
  label,
  ariaLabel,
  target,
  max,
  unit,
  confirmLabel,
  onSave,
}: TargetRowProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(target);

  const handleSave = () => {
    onSave(Math.max(1, Math.min(max, value)));
    setEditing(false);
  };

  return (
    <div className="set-row">
      <span className="set-label">{label}</span>
      {editing ? (
        <div className="flex items-center gap-2">
          <label htmlFor={id} className="sr-only">
            {ariaLabel}
          </label>
          <input
            id={id}
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            min={1}
            max={max}
            className="set-input"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setValue(target);
                setEditing(false);
              }
            }}
          />
          <button onClick={handleSave} className="btn btn-primary px-3 py-1.5 text-xs">
            {confirmLabel}
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setValue(target);
            setEditing(true);
          }}
          className="set-val"
        >
          {target} {unit}
          <svg
            className="w-3.5 h-3.5 opacity-50"
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
  );
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <h2 id="settings-title" className="set-title">
        {t("settingsTitle")}
      </h2>

      <TargetRow
        id="weekly-target"
        label={t("weeklyTarget")}
        ariaLabel={t("weeklyTargetLabel")}
        target={weeklyTarget}
        max={999}
        unit={t("unitPieces")}
        confirmLabel={t("confirm")}
        onSave={onSetTarget}
      />
      <TargetRow
        id="monthly-target"
        label={t("monthlyTarget")}
        ariaLabel={t("monthlyTargetLabel")}
        target={monthlyTarget}
        max={9999}
        unit={t("unitPieces")}
        confirmLabel={t("confirm")}
        onSave={onSetMonthlyTarget}
      />
      <TargetRow
        id="yearly-target"
        label={t("yearlyTarget")}
        ariaLabel={t("yearlyTargetLabel")}
        target={yearlyTarget}
        max={99999}
        unit={t("unitPieces")}
        confirmLabel={t("confirm")}
        onSave={onSetYearlyTarget}
      />

      <div className="set-split">
        <p className="set-label">{t("dataSection")}</p>
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
