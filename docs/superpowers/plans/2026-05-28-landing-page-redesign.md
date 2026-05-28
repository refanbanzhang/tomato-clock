# Landing Page 重设计 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重写 `/landing` 页面，采用"卡片叠层 · 精致阴影"风格，slate 基底色调、7 个 section（新增 Demo 区）

**Architecture:** 单页组件重写，`app/landing/page.tsx` 从 282 行精简重构。配合 5 个 i18n locale 文件新增 Demo 区翻译 key，'globals.css' 新增 Hero 装饰圆圈和卡片阴影工具类

**Tech Stack:** Next.js 15 App Router + Tailwind CSS v4 + React 19 + 静态导出

---

## 新增 i18n Keys

| Key | zh-CN | zh-TW | en | ja | ko |
|-----|-------|-------|----|----|-----|
| `landing_hero_label` | POMODORO TIMER | POMODORO TIMER | POMODORO TIMER | POMODORO TIMER | POMODORO TIMER |
| `landing_hero_learn` | 了解更多 | 了解更多 | Learn More | 詳細を見る | 더 알아보기 |
| `landing_demo_title` | 简洁高效的界面 | 簡潔高效的界面 | Clean & Efficient UI | シンプルで効率的なUI | 간결하고 효율적인 UI |
| `landing_demo_sub` | 打开即用，无干扰设计 | 打開即用，無干擾設計 | Works instantly, distraction-free | 開くだけ、集中できるデザイン | 열면 바로 사용, 방해 없는 디자인 |
| `landing_demo_timer_label` | 专注计时器 · 25分钟沉浸式 | 專注計時器 · 25分鐘沉浸式 | Focus Timer · 25min Immersive | 集中タイマー · 25分没入型 | 집중 타이머 · 25분 몰입형 |
| `landing_demo_calendar_label` | 专注日历 · 追踪每日成长 | 專注日曆 · 追蹤每日成長 | Focus Calendar · Track Daily Growth | 集中カレンダー · 毎日の成長を追跡 | 집중 캘린더 · 매일 성장 추적 |

---

## 文件变更范围

| 文件 | 操作 |
|------|------|
| `lib/i18n/locales/zh-CN.json` | 追加 6 个 key |
| `lib/i18n/locales/zh-TW.json` | 追加 6 个 key |
| `lib/i18n/locales/en.json` | 追加 6 个 key |
| `lib/i18n/locales/ja.json` | 追加 6 个 key |
| `lib/i18n/locales/ko.json` | 追加 6 个 key |
| `app/landing/page.tsx` | 完全重写 |
| `app/globals.css` | 新增工具类 |

---

### Task 1: 新增 i18n 翻译 Key — zh-CN（简体中文）

**Files:**
- Modify: `lib/i18n/locales/zh-CN.json`

所有语言文件的 key 结构一致，在 `"landing_hero_sub"` 之后、`"landing_why_title"` 之前插入 6 个新 key。为保持各文件行数同步，务必在相同位置插入。

- [ ] **Step 1: 追加 zh-CN 翻译 key**

在 `zh-CN.json` 的 `"landing_hero_sub"` 行后插入：

```json
  "landing_hero_label": "POMODORO TIMER",
  "landing_hero_learn": "了解更多",
  "landing_demo_title": "简洁高效的界面",
  "landing_demo_sub": "打开即用，无干扰设计",
  "landing_demo_timer_label": "专注计时器 · 25分钟沉浸式",
  "landing_demo_calendar_label": "专注日历 · 追踪每日成长",
```

- [ ] **Step 2: 验证 JSON 格式**

```bash
/Users/refanbanzhang/.workbuddy/binaries/node/versions/22.22.2/bin/node -e "JSON.parse(require('fs').readFileSync('/Users/refanbanzhang/Documents/github/tomato-clock/lib/i18n/locales/zh-CN.json','utf8')); console.log('valid')"
```

Expected: `valid`

- [ ] **Step 3: Commit**

```bash
cd /Users/refanbanzhang/Documents/github/tomato-clock
git add lib/i18n/locales/zh-CN.json
git commit -m "i18n: add demo section keys (zh-CN)"
```

---

### Task 2: 新增 i18n 翻译 Key — zh-TW（繁体中文）

**Files:**
- Modify: `lib/i18n/locales/zh-TW.json`

- [ ] **Step 1: 追加 zh-TW 翻译 key**

在 `"landing_hero_sub"` 行后插入：

```json
  "landing_hero_label": "POMODORO TIMER",
  "landing_hero_learn": "了解更多",
  "landing_demo_title": "簡潔高效的界面",
  "landing_demo_sub": "打開即用，無干擾設計",
  "landing_demo_timer_label": "專注計時器 · 25分鐘沉浸式",
  "landing_demo_calendar_label": "專注日曆 · 追蹤每日成長",
```

- [ ] **Step 2: 验证 JSON 格式**

```bash
/Users/refanbanzhang/.workbuddy/binaries/node/versions/22.22.2/bin/node -e "JSON.parse(require('fs').readFileSync('/Users/refanbanzhang/Documents/github/tomato-clock/lib/i18n/locales/zh-TW.json','utf8')); console.log('valid')"
```

- [ ] **Step 3: Commit**

```bash
git add lib/i18n/locales/zh-TW.json
git commit -m "i18n: add demo section keys (zh-TW)"
```

---

### Task 3: 新增 i18n 翻译 Key — en（英文）

**Files:**
- Modify: `lib/i18n/locales/en.json`

- [ ] **Step 1: 追加 en 翻译 key**

在 `"landing_hero_sub"` 行后插入：

```json
  "landing_hero_label": "POMODORO TIMER",
  "landing_hero_learn": "Learn More",
  "landing_demo_title": "Clean & Efficient UI",
  "landing_demo_sub": "Works instantly, distraction-free",
  "landing_demo_timer_label": "Focus Timer · 25min Immersive",
  "landing_demo_calendar_label": "Focus Calendar · Track Daily Growth",
```

- [ ] **Step 2: 验证 JSON 格式**

```bash
/Users/refanbanzhang/.workbuddy/binaries/node/versions/22.22.2/bin/node -e "JSON.parse(require('fs').readFileSync('/Users/refanbanzhang/Documents/github/tomato-clock/lib/i18n/locales/en.json','utf8')); console.log('valid')"
```

- [ ] **Step 3: Commit**

```bash
git add lib/i18n/locales/en.json
git commit -m "i18n: add demo section keys (en)"
```

---

### Task 4: 新增 i18n 翻译 Key — ja（日文）

**Files:**
- Modify: `lib/i18n/locales/ja.json`

- [ ] **Step 1: 追加 ja 翻译 key**

在 `"landing_hero_sub"` 行后插入：

```json
  "landing_hero_label": "POMODORO TIMER",
  "landing_hero_learn": "詳細を見る",
  "landing_demo_title": "シンプルで効率的なUI",
  "landing_demo_sub": "開くだけ、集中できるデザイン",
  "landing_demo_timer_label": "集中タイマー · 25分没入型",
  "landing_demo_calendar_label": "集中カレンダー · 毎日の成長を追跡",
```

- [ ] **Step 2: 验证 JSON 格式**

```bash
/Users/refanbanzhang/.workbuddy/binaries/node/versions/22.22.2/bin/node -e "JSON.parse(require('fs').readFileSync('/Users/refanbanzhang/Documents/github/tomato-clock/lib/i18n/locales/ja.json','utf8')); console.log('valid')"
```

- [ ] **Step 3: Commit**

```bash
git add lib/i18n/locales/ja.json
git commit -m "i18n: add demo section keys (ja)"
```

---

### Task 5: 新增 i18n 翻译 Key — ko（韩文）

**Files:**
- Modify: `lib/i18n/locales/ko.json`

- [ ] **Step 1: 追加 ko 翻译 key**

在 `"landing_hero_sub"` 行后插入：

```json
  "landing_hero_label": "POMODORO TIMER",
  "landing_hero_learn": "더 알아보기",
  "landing_demo_title": "간결하고 효율적인 UI",
  "landing_demo_sub": "열면 바로 사용, 방해 없는 디자인",
  "landing_demo_timer_label": "집중 타이머 · 25분 몰입형",
  "landing_demo_calendar_label": "집중 캘린더 · 매일 성장 추적",
```

- [ ] **Step 2: 验证 JSON 格式**

```bash
/Users/refanbanzhang/.workbuddy/binaries/node/versions/22.22.2/bin/node -e "JSON.parse(require('fs').readFileSync('/Users/refanbanzhang/Documents/github/tomato-clock/lib/i18n/locales/ko.json','utf8')); console.log('valid')"
```

- [ ] **Step 3: Commit**

```bash
git add lib/i18n/locales/ko.json
git commit -m "i18n: add demo section keys (ko)"
```

---

### Task 6: 更新 globals.css — 新增工具类

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: 在 @theme 块新增 slate 色板**

`globals.css` 中 `@theme` 块已定义 teal 色板，需追加 slate 色板：

```css
@theme {
  /* -- existing teal colors -- */
  --color-teal-950: #134e4a;
  --color-teal-900: #0f766e;
  --color-teal-600: #0d9488;
  --color-teal-500: #14b8a6;
  --color-teal-400: #2dd4bf;
  --color-teal-100: #ccfbf1;
  --color-teal-50: #f0fdfa;
  /* -- existing orange/amber -- */
  --color-orange-500: #f97316;
  --color-orange-600: #ea580c;
  --color-amber-500: #f59e0b;
  /* -- NEW: slate -- */
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;
  --font-display: var(--font-lora), "PingFang SC", "Microsoft YaHei", serif;
  --font-body: var(--font-raleway), "PingFang SC", "Microsoft YaHei", sans-serif;
}
```

- [ ] **Step 2: 在 @theme 块后新增 Landing 卡片工具类**

在 `/* ===== Base ===== */` 之前插入：

```css
/* ===== Landing Card ===== */
.landing-card {
  background: white;
  border: 1px solid var(--color-slate-100);
  border-radius: 1.375rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.03);
}

:where(.dark) .landing-card {
  background: var(--color-slate-800);
  border: 1px solid var(--color-slate-700);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.landing-icon-box {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.8125rem;
  background: var(--color-teal-50);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:where(.dark) .landing-icon-box {
  background: rgba(20, 184, 166, 0.12);
}

.landing-demo-frame {
  background: var(--color-slate-50);
  border: 2px dashed var(--color-teal-100);
  border-radius: 0.75rem;
}

:where(.dark) .landing-demo-frame {
  background: var(--color-slate-800);
  border-color: rgba(20, 184, 166, 0.15);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add slate palette and landing card utilities"
```

---

### Task 7: 重写 Landing Page（完整组件）

**Files:**
- Modify: `app/landing/page.tsx`

**说明：** 这是核心任务，完全重写 `app/landing/page.tsx`。保留原有 icon SVG 片段、i18n 逻辑、TomatoIcon 引用。按 7-section 结构组织，每个 section 独立为一个渲染块。

- [ ] **Step 1: 写入新 landing page 组件**

```tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import TomatoIcon from "@/app/components/TomatoIcon";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useLocale } from "@/lib/i18n";

export default function LandingPage() {
  const { t } = useLocale();

  useEffect(() => {
    document.title = t("landing_title");
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("landing_description"));
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
      {/* ========== 1. Nav ========== */}
      <nav className="sticky top-0 z-40 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-700/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 no-underline hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 cursor-pointer"
          >
            <TomatoIcon className="w-7 h-7 flex-shrink-0" />
            {t("landing_brand")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-[10px] text-sm font-semibold transition-colors hover:bg-slate-800 dark:hover:bg-slate-200"
            >
              {t("landing_cta_start")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== 2. Hero ========== */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900">
        {/* Decorative circles */}
        <div className="absolute top-[-40px] right-[-30px] w-[180px] h-[180px] rounded-full bg-teal-50 dark:bg-teal-900/20 opacity-70 pointer-events-none" />
        <div className="absolute bottom-[-20px] left-[-20px] w-[100px] h-[100px] rounded-full bg-amber-50 dark:bg-amber-900/10 opacity-40 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
          <span className="inline-block bg-teal-600/10 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-5">
            {t("landing_hero_label")}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[44px] font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            {t("landing_hero_line1")}
            <span className="text-teal-600 dark:text-teal-400">{t("landing_hero_highlight")}</span>
            {t("landing_hero_line3")}
          </h1>
          <p className="mt-4 max-w-md mx-auto text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {t("landing_hero_desc1")} {t("landing_hero_desc2")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-7 py-3.5 rounded-xl text-[15px] font-semibold transition-colors hover:bg-slate-800 dark:hover:bg-slate-200"
            >
              {t("landing_hero_btn")}
            </Link>
            <a
              href="#features"
              className="inline-flex items-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-7 py-3.5 rounded-xl text-[15px] font-semibold border-1.5 border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {t("landing_hero_learn")}
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            {t("landing_hero_sub")}
          </p>
        </div>
      </section>

      {/* ========== 3. Demo 截图区（新增） ========== */}
      <section className="bg-white dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-700/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="font-display text-2xl sm:text-[22px] font-bold tracking-tight text-center text-slate-900 dark:text-slate-100">
            {t("landing_demo_title")}
          </h2>
          <p className="mt-2 text-center text-[13px] text-slate-400 dark:text-slate-500">
            {t("landing_demo_sub")}
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 max-w-[840px] mx-auto">
            {/* 计时器截图 */}
            <div className="landing-card p-4 text-center">
              <div className="landing-demo-frame h-[200px] flex items-center justify-center text-teal-400 dark:text-teal-500/50 text-[13px]">
                🖼️ {t("landing_demo_timer_label")}
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {t("landing_demo_timer_label")}
              </p>
            </div>
            {/* 日历截图 */}
            <div className="landing-card p-4 text-center">
              <div className="landing-demo-frame h-[200px] flex items-center justify-center text-teal-400 dark:text-teal-500/50 text-[13px]">
                🖼️ {t("landing_demo_calendar_label")}
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {t("landing_demo_calendar_label")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 4. Features 痛点卡片 ========== */}
      <section id="features" className="bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="font-display text-2xl sm:text-[22px] font-bold tracking-tight text-center text-slate-900 dark:text-slate-100">
            {t("landing_why_title")}
          </h2>
          <p className="mt-2 text-center text-[13px] text-slate-400 dark:text-slate-500 max-w-md mx-auto">
            {t("landing_why_sub")}
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-3 max-w-[880px] mx-auto">
            {/* Feature 1 */}
            <div className="landing-card p-6 sm:p-7 text-center group cursor-pointer transition-shadow duration-200 hover:shadow-md">
              <div className="landing-icon-box mx-auto mb-4">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {t("landing_card1_title")}
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {t("landing_card1_desc")}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="landing-card p-6 sm:p-7 text-center group cursor-pointer transition-shadow duration-200 hover:shadow-md">
              <div className="landing-icon-box mx-auto mb-4">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {t("landing_card2_title")}
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {t("landing_card2_desc")}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="landing-card p-6 sm:p-7 text-center group cursor-pointer transition-shadow duration-200 hover:shadow-md">
              <div className="landing-icon-box mx-auto mb-4">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {t("landing_card3_title")}
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {t("landing_card3_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 5. How it works ========== */}
      <section className="bg-white dark:bg-slate-800/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="font-display text-2xl sm:text-[22px] font-bold tracking-tight text-center text-slate-900 dark:text-slate-100">
            {t("landing_steps_title")}
          </h2>
          <p className="mt-2 text-center text-[13px] text-slate-400 dark:text-slate-500 max-w-md mx-auto">
            {t("landing_steps_sub")}
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-3 max-w-[780px] mx-auto text-center">
            <div>
              <div className="w-[52px] h-[52px] mx-auto rounded-full bg-slate-900 dark:bg-white flex items-center justify-center shadow-sm">
                <span className="text-white dark:text-slate-900 font-display text-xl font-bold">1</span>
              </div>
              <h3 className="mt-5 font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {t("landing_step1_title")}
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {t("landing_step1_desc")}
              </p>
            </div>

            <div>
              <div className="w-[52px] h-[52px] mx-auto rounded-full bg-slate-900 dark:bg-white flex items-center justify-center shadow-sm">
                <span className="text-white dark:text-slate-900 font-display text-xl font-bold">2</span>
              </div>
              <h3 className="mt-5 font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {t("landing_step2_title")}
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {t("landing_step2_desc")}
              </p>
            </div>

            <div>
              <div className="w-[52px] h-[52px] mx-auto rounded-full bg-slate-900 dark:bg-white flex items-center justify-center shadow-sm">
                <span className="text-white dark:text-slate-900 font-display text-xl font-bold">3</span>
              </div>
              <h3 className="mt-5 font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {t("landing_step3_title")}
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {t("landing_step3_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 6. Stats ========== */}
      <section className="bg-slate-900 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center max-w-[760px] mx-auto">
            <div>
              <p className="font-display text-3xl sm:text-[32px] font-bold text-white">
                25<span className="text-teal-400 dark:text-teal-300 text-base ml-0.5">min</span>
              </p>
              <p className="mt-1.5 text-xs text-slate-400">{t("landing_stat_time")}</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-[32px] font-bold text-white">
                100%<span className="text-teal-400 dark:text-teal-300 text-base ml-0.5">free</span>
              </p>
              <p className="mt-1.5 text-xs text-slate-400">{t("landing_stat_free")}</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-[32px] font-bold text-white">
                {t("landing_stat_platform")}
              </p>
              <p className="mt-1.5 text-xs text-slate-400">{t("landing_stat_platform_val")}</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-[32px] font-bold text-white">
                {t("landing_stat_sync")}<span className="text-teal-400 dark:text-teal-300 text-base ml-0.5">{t("landing_stat_sync_val")}</span>
              </p>
              <p className="mt-1.5 text-xs text-slate-400">{t("landing_stat_sync_label")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 7. CTA + Footer ========== */}
      <section className="bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="font-display text-2xl sm:text-[22px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t("landing_cta_title")}
          </h2>
          <p className="mt-2 text-[13px] text-slate-400 dark:text-slate-500 max-w-md mx-auto">
            {t("landing_cta_sub")}
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-xl text-[15px] font-semibold transition-colors hover:bg-slate-800 dark:hover:bg-slate-200"
            >
              {t("landing_cta_btn")}
            </Link>
          </div>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="mt-auto border-t border-slate-100 dark:border-slate-700/40 bg-white dark:bg-slate-800/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-[800px]">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <TomatoIcon className="w-4 h-4" />
            <span>{t("landing_footer_brand")}</span>
          </div>
          <p className="text-[11px] text-slate-300 dark:text-slate-600">
            {t("landing_footer")}
          </p>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Build 验证**

```bash
cd /Users/refanbanzhang/Documents/github/tomato-clock
/Users/refanbanzhang/.workbuddy/binaries/node/versions/22.22.2/bin/npm run build
```

Expected: 构建成功，无 TypeScript 错误

- [ ] **Step 3: Commit**

```bash
git add app/landing/page.tsx
git commit -m "feat: redesign landing page - card-layered style, 7 sections with demo"
```

---

### Task 8: 最终验证 — 构建 + 检查

**Files:** 无

- [ ] **Step 1: 构建 + 检查输出**

```bash
cd /Users/refanbanzhang/Documents/github/tomato-clock
/Users/refanbanzhang/.workbuddy/binaries/node/versions/22.22.2/bin/npm run build
```

验证：
1. 构建成功，无 error
2. `out/landing/index.html` 存在
3. 检查 HTML 中包含所有 7 个 section

- [ ] **Step 2: 确认所有 locale 文件 JSON 有效**

```bash
cd /Users/refanbanzhang/Documents/github/tomato-clock
for f in lib/i18n/locales/*.json; do
  /Users/refanbanzhang/.workbuddy/binaries/node/versions/22.22.2/bin/node -e "JSON.parse(require('fs').readFileSync('$f','utf8')); console.log('$f: valid')"
done
```

- [ ] **Step 3: Commit（如无变更则跳过）**

---

## 实现顺序

```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8
```

i18n keys 必须先准备好，否则 Task 7 的组件会引用不存在的 key 导致 TypeScript 报错。
