import type { ReactNode } from "react";

interface ClockScreenProps {
  cat: string;
  seconds: number;
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
  cat,
  seconds,
  action,
  actionLabel,
  actionClass,
  onAction,
  children,
}: ClockScreenProps) {
  return (
    <>
      <div className="cat-box">
        <img className="cat" src={cat} alt="" />
      </div>
      <p className="time" aria-live="polite">
        {clockText(seconds)}
      </p>
      <div className="acts">
        {children}
        <button className={actionClass} type="button" aria-label={actionLabel} onClick={onAction}>
          {action}
        </button>
      </div>
      <div className="tail" />
    </>
  );
}
