export type TimerMode = "idle" | "focusing" | "paused";

export interface PomodoroSession {
  id: string;
  startDate: string;
  endDate: string;
  plannedSeconds: number;
  /** 这次番茄在做什么。旧记录没有这个字段。 */
  tag?: string;
  /** 分类最后一次写入的时间。用来合并修改，不参与展示。 */
  tagAt?: number;
}

export interface AppState {
  sessions: PomodoroSession[];
  /** 可选标签，顺序就是用户添加的顺序。 */
  tags: string[];
  /** 下一次开始时用的标签。计时中以计时器上的 tag 为准。 */
  currentTag?: string;
}

export const FOCUS_SECONDS = 25 * 60;
