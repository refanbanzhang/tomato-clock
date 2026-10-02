import { useMemo } from "react";
import { buildHeatmap, totalMinutes } from "@/lib/heatmap";
import type { PomodoroSession } from "@/lib/types";

interface HeatmapProps {
  sessions: PomodoroSession[];
}

export default function Heatmap({ sessions }: HeatmapProps) {
  const weeks = useMemo(() => buildHeatmap(sessions), [sessions]);
  const minutes = useMemo(() => totalMinutes(weeks), [weeks]);
  const days = useMemo(
    () =>
      weeks
        .flat()
        .filter((day) => !day.future && day.minutes > 0)
        .reverse(),
    [weeks]
  );

  return (
    <section aria-label="专注记录">
      <h2>专注记录</h2>
      <p>过去一年 {minutes} 分钟</p>
      {days.length === 0 ? (
        <p>无记录</p>
      ) : (
        <table>
          <tbody>
            {days.map((day) => (
              <tr key={day.key}>
                <th scope="row">
                  {day.date.toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </th>
                <td>{day.minutes} 分钟</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
