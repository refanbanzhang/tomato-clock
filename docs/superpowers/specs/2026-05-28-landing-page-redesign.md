# Landing Page 重设计 — 设计规范

**日期**: 2026-05-28
**状态**: 已确认

---

## 概述

重新设计番茄时钟的 landing page（`/landing` 路由），采用"卡片叠层 · 精致阴影"风格，在现有 6 个 section 基础上新增产品截图展示区。

## 视觉方向

- **风格**: 精致简约 — 卡片叠层 · 精致阴影
- **底色**: `#f8fafc`（slate-50），替代原 teal-50
- **主文字**: `#0f172a`（slate-900）
- **强调色**: `#0d9488`（teal-600）
- **辅助文字**: `#94a3b8`（级别） / `#64748b`（次要）
- **CTA 主按钮**: `#0f172a` 深色底白色字，替代原 orange-500
- **CTA 次按钮**: 白色底 + `border: #e2e8f0`
- **卡片圆角**: `rounded-3xl`（22px）
- **卡片阴影**: `box-shadow: 0 4px 24px rgba(0,0,0,0.03)`
- **暗色模式**: 全局兼容 `dark:` 变体

## 页面结构（7 个 Section）

### 1. Nav（导航栏）
- sticky top-0，毛玻璃效果（`backdrop-blur-xl`）
- 左侧：TomatoIcon + "番茄时钟" brand
- 右侧：语言切换器 + "开始使用" CTA

### 2. Hero
- 居中布局，背景带淡色装饰圆圈（teal-50 + amber-50，`absolute` 定位，`rounded-full`）
- 小标签：`<badge>` — "POMODORO TIMER"，teal-600 浅底
- 大标题："专注，从一个番茄开始"（44px，font-weight 700）
- 副标题：单行描述（15px，text-slate-500）
- 双 CTA 按钮横向排列：主按钮（深色底"免费开始使用"）+ 次按钮（白色描边"了解更多"）
- "无需注册，打开即用" 小字

### 3. Demo 截图区（新增）
- 白色底，`border-y`
- 标题："简洁高效的界面" + 副标题："打开即用，无干扰设计"
- 2 列 grid，每列一个截图卡片：
  - 左：计时器界面截图
  - 右：日历热力图截图
- 截图卡片：`bg-slate-50`，`rounded-2xl`，`border`，下方带描述文字
- 初期用占位框（虚线 border teal-50），后续替换实际截图

### 4. Features（痛点卡片）
- 标题："为什么需要番茄工作法？"
- 3 列 grid，每张卡片：
  - 白色底 + `shadow` + `rounded-3xl` + `border`
  - 图标（emoji）居中，放在 teal-50 小圆角框内
  - 标题（15px，font-bold）+ 描述文字（12px，text-slate-400）

### 5. How it works（流程步骤）
- 标题："三步开始"
- 3 列 grid，每列居中：
  - 圆形数字标记（深色底 #0f172a，52px 直径）
  - 步骤标题 + 描述

### 6. Stats（数据亮点）
- 深色背景 `#0f172a`（替代原 teal-600）
- 4 列 grid，大数字 + 小标签
- 内容：25min / 100% free / 跨平台 / 秒级同步

### 7. CTA + Footer
- 标题 + 副标题 + 深色 CTA 按钮
- Footer：TomatoIcon + "Tomato Clock" + 开源声明

## 技术约束

- 项目：Next.js 15 App Router，`app/landing/page.tsx`
- 样式：Tailwind CSS v4（`@theme` 配置在 `globals.css`）
- 零第三方 UI 库，纯 Tailwind + 内联 SVG 图标
- 静态导出（`output: "export"`），生产环境 `basePath: "/tomato-clock/"`
- 国际化：5 种语言（zh-CN, zh-TW, en, ja, ko），通过 `useLocale()` hook
- 暗色模式：`.dark` class + `prefers-color-scheme` 检测
- 字体：Lora（display）+ Raleway（body）

## 实现清单

- [ ] 更新 `app/landing/page.tsx` — 重写组件结构
- [ ] 新增 Demo section，含占位截图框
- [ ] 调整配色：slate 基底 + 柔和阴影
- [ ] Hero 重设计：装饰圆圈 + badge + 双按钮
- [ ] 卡片样式统一：rounded-3xl + shadow
- [ ] Stats 背景色改为 slate-900
- [ ] Steps 数字标记改为深色
- [ ] CTA 按钮从 orange 改为深色
- [ ] 暗色模式适配检查
- [ ] i18n key 检查（新增 Demo section 的翻译需补充）

## 文件变更范围

| 文件 | 操作 |
|------|------|
| `app/landing/page.tsx` | 重写 |
| `lib/i18n/locales/*.json`（5 个文件） | 新增 Demo 区翻译 key |
| `app/globals.css` | 可能需要调整 `@theme` 颜色定义 |
