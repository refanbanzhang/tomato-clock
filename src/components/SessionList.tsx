import type { PomodoroSession } from "@/lib/types";

interface SessionListProps {
  sessions: PomodoroSession[];
  tags: string[];
  onRetag: (id: string, tag: string) => void;
}

function whenText(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = date.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
  const time = date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${day} ${time}`;
}

export default function SessionList({ sessions, tags, onRetag }: SessionListProps) {
  const rows = [...sessions].sort((a, b) => (a.endDate < b.endDate ? 1 : a.endDate > b.endDate ? -1 : 0));

  return (
    <section className="logs" aria-label="番茄记录">
      {tags.length === 0 && <p className="logs-hint">先添加标签，再改这些记录的分类</p>}
      <ul className="log-list">
        {rows.map((session) => {
          const choices = session.tag && !tags.includes(session.tag) ? [session.tag, ...tags] : tags;
          const minutes = Math.round(session.plannedSeconds / 60);
          return (
            <li className="log" key={session.id}>
              <span className="log-when">
                {whenText(session.endDate)} · {minutes}分钟
              </span>
              <select
                className="log-tag"
                aria-label={`${whenText(session.endDate)}的分类`}
                value={session.tag ?? ""}
                onChange={(event) => onRetag(session.id, event.target.value)}
              >
                <option value="">未分类</option>
                {choices.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
