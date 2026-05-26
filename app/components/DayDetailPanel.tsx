import type { PomodoroSession } from "@/lib/types";

interface DayDetailPanelProps {
  date: Date;
  count: number;
  sessions: PomodoroSession[];
}

export default function DayDetailPanel({
  date,
  count,
  sessions,
}: DayDetailPanelProps) {
  return (
    <div className="card mt-4 p-4">
      <h3 className="text-sm font-semibold text-teal-950 mb-2">
        {date.toLocaleDateString("zh-CN", {
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      </h3>

      {sessions.length === 0 ? (
        <p className="subtitle">当天没有完成的番茄记录</p>
      ) : (
        <div className="space-y-2">
          <p className="subtitle">
            完成{" "}
            <span className="font-semibold text-teal-600">{count}</span> 个番茄
          </p>
          <div className="space-y-1.5">
            {sessions.map((s) => {
              const start = new Date(s.startDate);
              const end = new Date(s.endDate);
              const durationMin = Math.round(
                (end.getTime() - start.getTime()) / 60000
              );
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-xs text-slate-500 bg-teal-50 rounded-lg px-3 py-2"
                >
                  <span>
                    {start.toLocaleTimeString("zh-CN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {end.toLocaleTimeString("zh-CN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-slate-400">{durationMin} 分钟</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
