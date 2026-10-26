import Heatmap from "@/components/Heatmap";
import { countToday } from "@/lib/stats";
import type { PomodoroSession } from "@/lib/types";

interface SideBoardProps {
  sessions: PomodoroSession[];
  tags: string[];
  onRetag: (id: string, tag: string) => void;
  onBack: () => void;
}

export default function SideBoard({ sessions, tags, onRetag, onBack }: SideBoardProps) {
  const today = countToday(sessions);

  return (
    <div className="stage">
      <div className="nav">
        <button className="btn" type="button" onClick={onBack}>
          返回
        </button>
      </div>
      <section className="stats" aria-label="专注统计">
        <h1 className="cfg-title">统计</h1>
        <div className="nums">
          <p className="num">
            <span className="num-n">{today}</span>
            <span className="num-k">今日</span>
          </p>
          <p className="num">
            <span className="num-n">{sessions.length}</span>
            <span className="num-k">累计</span>
          </p>
        </div>
        <Heatmap sessions={sessions} tags={tags} onRetag={onRetag} />
      </section>
    </div>
  );
}
