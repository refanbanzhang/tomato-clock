import { useMemo, useState } from "react";
import { formatDate, useLocale } from "@/lib/i18n";
import type { Locale, TFn } from "@/lib/i18n";
import {
  buildHeatmap,
  monthLabelDate,
  totalMinutes,
  type HeatDay,
} from "@/lib/heatmap";
import type { PomodoroSession } from "@/lib/types";

const ROW_LABELS = [
  null,
  "weekday_mon",
  null,
  "weekday_wed",
  null,
  "weekday_fri",
  null,
] as const;

interface HeatmapProps {
  sessions: PomodoroSession[];
}

function dayText(day: HeatDay, locale: Locale, t: TFn): string {
  const when = formatDate(locale, day.date, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  if (day.minutes <= 0) return `${when} · ${t("heatNone")}`;
  return `${when} · ${day.minutes} ${t("minutesUnit")}`;
}

export default function Heatmap({ sessions }: HeatmapProps) {
  const { t, locale } = useLocale();
  const weeks = useMemo(() => buildHeatmap(sessions), [sessions]);
  const minutes = useMemo(() => totalMinutes(weeks), [weeks]);
  const [pickedKey, setPickedKey] = useState<string | null>(null);

  const picked = useMemo(() => {
    const days = weeks.flat().filter((day) => !day.future);
    if (pickedKey) {
      const found = days.find((day) => day.key === pickedKey);
      if (found) return found;
    }
    return days[days.length - 1] ?? null;
  }, [weeks, pickedKey]);

  return (
    <section className="heat" aria-label={t("heatTitle")}>
      <div className="heat-head">
        <h2 className="heat-title">{t("heatTitle")}</h2>
        <p className="heat-sum">{t("heatYear", { n: minutes })}</p>
      </div>

      <div className="heat-board">
        <div className="heat-side" aria-hidden="true">
          <span className="heat-month-gap" />
          <div className="heat-days">
            {ROW_LABELS.map((key, index) => (
              <span key={index}>{key ? t(key) : ""}</span>
            ))}
          </div>
        </div>

        <div className="heat-scroll">
          <div className="heat-months">
            {weeks.map((week, index) => {
              const labelDate = monthLabelDate(week, index);
              const label = labelDate
                ? formatDate(locale, labelDate, { month: "short" })
                : "";
              return (
                <span className="heat-month" key={week[0]?.key ?? index}>
                  {label}
                </span>
              );
            })}
          </div>
          <div className="heat-weeks">
            {weeks.map((week) => (
              <div className="heat-week" key={week[0]?.key ?? "week"}>
                {week.map((day) =>
                  day.future ? (
                    <span className="heat-pad" key={day.key} />
                  ) : (
                    <button
                      key={day.key}
                      type="button"
                      tabIndex={-1}
                      className={
                        day.key === picked?.key
                          ? `heat-cell heat-lv-${day.level} heat-on`
                          : `heat-cell heat-lv-${day.level}`
                      }
                      aria-label={dayText(day, locale, t)}
                      onClick={() => setPickedKey(day.key)}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="heat-foot">
        <p className="heat-detail">{picked ? dayText(picked, locale, t) : ""}</p>
        <div className="heat-legend" aria-hidden="true">
          <span>{t("heatLess")}</span>
          <span className="heat-cell heat-lv-0" />
          <span className="heat-cell heat-lv-1" />
          <span className="heat-cell heat-lv-2" />
          <span className="heat-cell heat-lv-3" />
          <span className="heat-cell heat-lv-4" />
          <span>{t("heatMore")}</span>
        </div>
      </div>
    </section>
  );
}
