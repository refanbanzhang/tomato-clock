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

/** 标签目录里的一条。删除留下 off，同步时才不会被另一台设备加回来。 */
export interface TagEntry {
  name: string;
  /** 添加、重新添加或删除的时间。 */
  at: number;
  off?: boolean;
}

export interface AppState {
  sessions: PomodoroSession[];
  /** 标签目录，含已删除的记录。展示用 tagNames。 */
  tags: TagEntry[];
  /** 下一次开始时用的标签。计时中以计时器上的 tag 为准。只留在本机。 */
  currentTag?: string;
}

export const FOCUS_SECONDS = 25 * 60;
