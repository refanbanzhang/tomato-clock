import type { ReactNode } from "react";

interface ClockScreenProps {
  title: string;
  cat: string;
  seconds: number;
  total: number;
  action: string;
  actionLabel: string;
  actionClass: string;
  onAction: () => void;
  children?: ReactNode;
}

function clockText(seconds: number): string {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ClockScreen({
  title,
  cat,
  seconds,
  total,
  action,
  actionLabel,
  actionClass,
  onAction,
  children,
}: ClockScreenProps) {
  const elapsed = Math.max(0, total - Math.max(0, seconds));
  const ratio = total > 0 ? Math.min(1, elapsed / total) : 0;
  const fill = ratio <= 0 ? "0" : `${ratio * 100}%`;
  return (
    <>
      <h1 className="title">{title}</h1>
      <img className="cat" src={cat} alt="" />
      <p className="time" aria-live="polite">
        {clockText(seconds)}
      </p>
      <div
        className="bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(total, elapsed)}
        aria-label="番茄进度"
      >
        <div className="bar-fill" style={{ width: fill }} />
      </div>
      {children}
      <button className={actionClass} type="button" aria-label={actionLabel} onClick={onAction}>
        {action}
      </button>
      <div className="tail" />
    </>
  );
}
