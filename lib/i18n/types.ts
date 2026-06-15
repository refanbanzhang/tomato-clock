export type Locale = "zh-CN" | "zh-TW" | "en" | "ja" | "ko";

export interface Translations {
  // Layout
  siteTitle: string;
  siteDescription: string;

  // Navigation
  navTimer: string;
  navCalendar: string;

  // Timer page
  timerTitle: string;
  timerSubtitle: string;
  loading: string;
  settings: string;
  close: string;
  footer: string;

  // Timer states
  readyToStart: string;
  focusing: string;
  paused: string;

  // Timer controls
  startFocus: string; // "开始 {minutes} 分钟" / "Start {minutes} min"
  shortcut: string;
  pause: string;
  finishEarly: string;
  notCounted: string;
  giveUp: string;
  resume: string;

  // Settings panel
  settingsTitle: string;
  weeklyTarget: string;
  weeklyTargetLabel: string;
  confirm: string;
  unitPieces: string; // "个" in Chinese, count unit
  focusDuration: string; // "专注时长 25 分钟"
  shortcuts: string;
  shortcutStartPause: string;

  // Data export / import
  dataSection: string;
  dataSectionHint: string;
  exportData: string;
  importData: string;
  importConfirm: string;
  importSuccess: string;
  importSuccessSub: string; // "已导入 {n} 条番茄记录"
  importErrorInvalidJson: string;
  importErrorInvalidFormat: string;

  // Notifications
  notificationTitle: string;
  notificationBody: string;
  toastTitle: string;
  toastSubtitle: string;
  weeklyCompleteTitle: string;
  weeklyCompleteSub: string;
  weeklyCompleteBtn: string;

  // Notification errors
  browserNoSupport: string;
  notificationNeedHttps: string;
  notificationDenied: string;
  notificationRequestDenied: string;
  notificationRequestFailed: string;

  // Stats
  thisWeek: string;
  target: string;
  thisMonth: string;
  thisYear: string;
  weeklyProgress: string;
  weeklyProgressUnit: string;
  weeklyProgressDone: string;

  // Calendar page
  calendarTitle: string;
  calendarSubtitle: string;

  // CalendarView
  prevMonth: string;
  today: string;
  nextMonth: string;
  completedThisMonth: string; // "本月完成 {n} 个番茄"
  tomatoes: string; // "个番茄"

  // Weekday labels
  weekday_mon: string;
  weekday_tue: string;
  weekday_wed: string;
  weekday_thu: string;
  weekday_fri: string;
  weekday_sat: string;
  weekday_sun: string;

  // DayDetail
  noPomodoros: string;
  completedTomatoes: string; // "完成 {n} 个番茄"
  minutesUnit: string; // "分钟" / "min"

  // Landing page
  landing_title: string;
  landing_description: string;
  landing_brand: string;
  landing_cta_start: string;
  landing_hero_line1: string;
  landing_hero_highlight: string;
  landing_hero_line3: string;
  landing_hero_desc1: string;
  landing_hero_desc2: string;
  landing_hero_btn: string;
  landing_hero_sub: string;
  landing_hero_label: string;
  landing_hero_learn: string;
  landing_demo_title: string;
  landing_demo_sub: string;
  landing_demo_timer_label: string;
  landing_demo_calendar_label: string;
  landing_why_title: string;
  landing_why_sub: string;
  landing_card1_title: string;
  landing_card1_desc: string;
  landing_card2_title: string;
  landing_card2_desc: string;
  landing_card3_title: string;
  landing_card3_desc: string;
  landing_steps_title: string;
  landing_steps_sub: string;
  landing_step1_title: string;
  landing_step1_desc: string;
  landing_step2_title: string;
  landing_step2_desc: string;
  landing_step3_title: string;
  landing_step3_desc: string;
  landing_stat_time: string;
  landing_stat_free: string;
  landing_stat_platform: string;
  landing_stat_platform_val: string;
  landing_stat_sync: string;
  landing_stat_sync_val: string;
  landing_stat_sync_label: string;
  landing_cta_title: string;
  landing_cta_sub: string;
  landing_cta_btn: string;
  landing_footer: string;
  landing_footer_brand: string;

  // Auth
  authAccount: string;
  authAccountHint: string;
  authLoginTitle: string;
  authLoginSub: string;
  authRegisterTitle: string;
  authRegisterSub: string;
  authForgotTitle: string;
  authForgotSub: string;
  authResetTitle: string;
  authResetSub: string;
  authResetWaiting: string;
  authEmail: string;
  authPassword: string;
  authNewPassword: string;
  authConfirmPassword: string;
  authLoginBtn: string;
  authRegisterBtn: string;
  authSendResetBtn: string;
  authResetBtn: string;
  authChangePassword: string;
  authChangePasswordBtn: string;
  authSignOut: string;
  authForgotLink: string;
  authLoginLink: string;
  authRegisterLink: string;
  authBackHome: string;
  authLoading: string;
  authPasswordMismatch: string;
  authErrorGeneric: string;
  authRegisterCheckEmail: string;
  authResetEmailSent: string;
  authPasswordChanged: string;
  authSignedOut: string;
  authInvalidCredentials: string;
  authEmailNotConfirmed: string;
  authCallbackTitle: string;
  authCallbackSub: string;
  authCallbackFailed: string;
  authCallbackFailedSub: string;
  authCallbackNoSession: string;
  authInvalidCredentialsHint: string;
  authEmailRateLimit: string;
  authEmailRateLimitHint: string;
  authEmailSendFailed: string;
  authEmailSendFailedHint: string;
}

// Helper: typed translation function
export type TFn = (key: keyof Translations, params?: Record<string, string | number>) => string;
