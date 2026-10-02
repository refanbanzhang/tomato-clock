import Heatmap from "@/components/Heatmap";
import { countToday } from "@/lib/stats";
import type { PomodoroSession } from "@/lib/types";

interface SideBoardProps {
  sessions: PomodoroSession[];
}

export default function SideBoard({ sessions }: SideBoardProps) {
  const today = countToday(sessions);

  return (
    <aside className="side" aria-label="专注统计">
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
      <Heatmap sessions={sessions} />
    </aside>
  );
}
