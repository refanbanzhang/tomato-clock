import { useEffect, useMemo, useRef, useState } from "react";
import { buildHeatmap, type HeatDay } from "@/lib/heatmap";
import type { PomodoroSession } from "@/lib/types";
import "@/heatmap.css";

interface HeatmapProps {
  sessions: PomodoroSession[];
}

const GOAL_HOURS = 10000;

function focusHours(sessions: PomodoroSession[]): number {
  let seconds = 0;
  for (const session of sessions) {
    if (!Number.isFinite(session.plannedSeconds) || session.plannedSeconds <= 0) continue;
    seconds += session.plannedSeconds;
  }
  return seconds / 3600;
}

function hourLabel(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function dayText(day: HeatDay): string {
  const date = day.date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  if (day.future) return date;
  return `${date}，${day.minutes} 分钟`;
}

function monthMarks(weeks: HeatDay[][]): { col: number; text: string }[] {
  const marks: { col: number; text: string }[] = [];
  for (let col = 0; col < weeks.length; col++) {
    const firstOfMonth = weeks[col].find((day) => day.date.getDate() === 1);
    if (!firstOfMonth) continue;
    const prev = marks[marks.length - 1];
    if (prev && col - prev.col < 2) continue;
    marks.push({
      col,
      text: firstOfMonth.date.toLocaleDateString("zh-CN", { month: "short" }),
    });
  }
  return marks;
}

interface Tip {
  text: string;
  x: number;
  y: number;
  edge: "start" | "end" | "mid";
}

function placeTip(el: HTMLElement, text: string): Tip {
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const edge = x < 140 ? "start" : x > window.innerWidth - 140 ? "end" : "mid";
  return { text, x: edge === "start" ? rect.left : edge === "end" ? rect.right : x, y: rect.top, edge };
}

export default function Heatmap({ sessions }: HeatmapProps) {
  const weeks = useMemo(() => buildHeatmap(sessions), [sessions]);
  const months = useMemo(() => monthMarks(weeks), [weeks]);
  const hours = useMemo(() => focusHours(sessions), [sessions]);
  const [tip, setTip] = useState<Tip | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ratio = Math.min(1, hours / GOAL_HOURS);
  const fill = hours <= 0 ? "0" : `max(4px, ${ratio * 100}%)`;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
  }, [weeks]);

  function showTip(day: HeatDay, el: HTMLElement) {
    setTip(placeTip(el, dayText(day)));
  }

  return (
    <section className="heat" aria-label="专注记录">
      <div className="goal">
        <p className="goal-top">
          <span className="goal-name">一万小时</span>
          <span className="goal-num">
            {hourLabel(hours)} / {GOAL_HOURS}
          </span>
        </p>
        <div
          className="goal-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={GOAL_HOURS}
          aria-valuenow={Math.min(GOAL_HOURS, hours)}
          aria-label="一万小时进度"
        >
          <div className="goal-fill" style={{ width: fill }} />
        </div>
      </div>
      {tip && (
        <p className={`heat-pop ${tip.edge}`} role="status" style={{ left: tip.x, top: tip.y }}>
          {tip.text}
        </p>
      )}
      <div className="heat-box">
      <div className="heat-scroll" ref={scrollRef}>
        <div className="heat-layout">
          <div className="heat-main">
            <div
              className="heat-months"
              aria-hidden="true"
              style={{ gridTemplateColumns: `repeat(${weeks.length}, var(--cell))` }}
            >
              {months.map((month) => (
                <span
                  className="heat-month"
                  key={month.col}
                  style={{ gridColumn: month.col + 1 }}
                >
                  {month.text}
                </span>
              ))}
            </div>
            <div className="heat-cells" role="img" aria-label="过去一年的专注记录">
              {weeks.flat().map((day) => (
                <span
                  key={day.key}
                  className={`heat-cell heat-${day.level}`}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "touch") return;
                    showTip(day, event.currentTarget);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === "touch") return;
                    setTip(null);
                  }}
                  onClick={(event) => showTip(day, event.currentTarget)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="heat-legend" aria-hidden="true">
        <span>少</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`heat-cell heat-${level}`} />
        ))}
        <span>多</span>
      </p>
      </div>
    </section>
  );
}
