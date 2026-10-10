import { useEffect, useMemo, useRef, useState } from "react";
import SessionList from "@/components/SessionList";
import { buildHeatmap, type HeatDay } from "@/lib/heatmap";
import { GOAL_HOURS, hoursByTag, isSameDay } from "@/lib/stats";
import type { PomodoroSession } from "@/lib/types";
import "@/heatmap.css";

interface HeatmapProps {
  sessions: PomodoroSession[];
  tags: string[];
  onRetag: (id: string, tag: string) => void;
}

function hourLabel(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function dateLabel(day: HeatDay): string {
  return day.date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function dayText(day: HeatDay): string {
  const date = dateLabel(day);
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

function Goal({ tag, hours }: { tag: string; hours: number }) {
  const ratio = Math.min(1, hours / GOAL_HOURS);
  const fill = hours <= 0 ? "0" : `max(4px, ${ratio * 100}%)`;
  return (
    <div className="goal">
      <p className="goal-top">
        <span className="goal-name">{tag}</span>
        <span className="goal-num">
          {hourLabel(hours)} / {GOAL_HOURS}
        </span>
      </p>
      <div
        className="goal-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={GOAL_HOURS}
        aria-valuenow={Math.min(GOAL_HOURS, Math.round(hours * 10) / 10)}
        aria-label={`${tag}一万小时`}
      >
        <div className="goal-fill" style={{ width: fill }} />
      </div>
    </div>
  );
}

function daySessions(sessions: PomodoroSession[], day: HeatDay): PomodoroSession[] {
  return sessions.filter((session) => {
    const end = new Date(session.endDate);
    return !Number.isNaN(end.getTime()) && isSameDay(end, day.date);
  });
}

export default function Heatmap({ sessions, tags, onRetag }: HeatmapProps) {
  const weeks = useMemo(() => buildHeatmap(sessions), [sessions]);
  const months = useMemo(() => monthMarks(weeks), [weeks]);
  const goals = useMemo(() => hoursByTag(sessions, tags), [sessions, tags]);
  const [tip, setTip] = useState<Tip | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const openDay = weeks.flat().find((day) => day.key === openKey) ?? null;
  const openSessions = openDay ? daySessions(sessions, openDay) : [];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
  }, [weeks]);

  function showTip(day: HeatDay, el: HTMLElement) {
    setTip(placeTip(el, dayText(day)));
  }

  function pickDay(day: HeatDay) {
    if (day.future) return;
    setTip(null);
    setOpenKey((key) => (key === day.key ? null : day.key));
  }

  return (
    <section className="heat" aria-label="专注记录">
      {goals.length === 0 ? (
        <p className="goal-empty">添加标签后，按类型统计一万小时</p>
      ) : (
        <div className="goals">
          {goals.map((goal) => (
            <Goal key={goal.tag} tag={goal.tag} hours={goal.hours} />
          ))}
        </div>
      )}
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
            <div className="heat-cells" role="group" aria-label="过去一年的专注记录">
              {weeks.flat().map((day) => (
                <button
                  key={day.key}
                  type="button"
                  className={`heat-cell heat-${day.level}${openKey === day.key ? " heat-on" : ""}`}
                  aria-label={dayText(day)}
                  aria-pressed={openKey === day.key}
                  disabled={day.future}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "touch") return;
                    showTip(day, event.currentTarget);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === "touch") return;
                    setTip(null);
                  }}
                  onClick={() => pickDay(day)}
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
      {openDay && (
        openSessions.length > 0 ? (
          <SessionList sessions={openSessions} tags={tags} onRetag={onRetag} />
        ) : (
          <p className="day-empty">{dateLabel(openDay)}没有记录</p>
        )
      )}
    </section>
  );
}
