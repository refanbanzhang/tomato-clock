interface ClockScreenProps {
  title: string;
  cat: string;
  seconds: number;
  action: string;
  actionLabel: string;
  actionClass: string;
  onAction: () => void;
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
  action,
  actionLabel,
  actionClass,
  onAction,
}: ClockScreenProps) {
  return (
    <>
      <h1 className="title">{title}</h1>
      <img className="cat" src={cat} alt="" />
      <p className="time" aria-live="polite">
        {clockText(seconds)}
      </p>
      <button className={actionClass} type="button" aria-label={actionLabel} onClick={onAction}>
        {action}
      </button>
      <div className="tail" />
    </>
  );
}
