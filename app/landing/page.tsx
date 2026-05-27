import Link from "next/link";
import type { Metadata } from "next";
import TomatoIcon from "@/app/components/TomatoIcon";

export const metadata: Metadata = {
  title: "番茄时钟 - 专注，从一个番茄开始",
  description:
    "简单高效的番茄工作法计时器，25分钟专注时段帮你告别拖延、提升效率。支持跨平台数据同步。",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-teal-50 text-teal-950 antialiased">
      {/* ========== Nav ========== */}
      <nav className="sticky top-0 z-40 bg-teal-50/95 backdrop-blur-sm border-b border-teal-100/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-teal-950 no-underline hover:text-teal-900 transition-colors duration-200 cursor-pointer"
          >
            <TomatoIcon className="w-7 h-7 flex-shrink-0" />
            番茄时钟
          </Link>
          <Link
            href="/"
            className="btn btn-cta text-sm py-2.5 px-5 rounded-lg"
          >
            开始使用
          </Link>
        </div>
      </nav>

      {/* ========== Hero ========== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-teal-950 leading-tight">
            专注，从
            <span className="text-teal-600">一个番茄</span>
            开始
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-base sm:text-lg text-teal-900/70 leading-relaxed">
            简单高效的番茄工作法计时器。
            <br className="hidden sm:block" />
            25 分钟专注时段，帮你告别拖延、提升效率。
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="btn btn-cta text-base px-8 py-3.5 rounded-xl"
            >
              免费开始使用
            </Link>
            <p className="text-xs text-teal-900/40">
              无需注册，打开即用
            </p>
          </div>
        </div>
      </section>

      {/* ========== Features ========== */}
      <section className="bg-white border-y border-teal-100/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-center text-teal-950">
            为什么需要番茄工作法？
          </h2>
          <p className="mt-3 text-center text-sm text-teal-900/50 max-w-md mx-auto">
            专注力是稀缺资源，番茄工作法帮你科学管理注意力
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-teal-100/50 bg-teal-50/40 p-6 sm:p-8 cursor-pointer transition-colors duration-200 hover:border-teal-500 hover:bg-teal-50">
              <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center mb-5 transition-colors duration-200 group-hover:bg-teal-500/30">
                <svg
                  className="w-6 h-6 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-teal-950">
                难以专注
              </h3>
              <p className="mt-2 text-sm text-teal-900/60 leading-relaxed">
                信息碎片化时代，注意力不断被打断。25 分钟专注时段帮你拆分复杂任务，降低心理门槛。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-teal-100/50 bg-teal-50/40 p-6 sm:p-8 cursor-pointer transition-colors duration-200 hover:border-teal-500 hover:bg-teal-50">
              <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center mb-5 transition-colors duration-200 group-hover:bg-teal-500/30">
                <svg
                  className="w-6 h-6 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-teal-950">
                缺乏节奏
              </h3>
              <p className="mt-2 text-sm text-teal-900/60 leading-relaxed">
                长时间工作导致疲劳累积，效率递减。工作与休息交替循环，让你全天保持最佳状态。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-teal-100/50 bg-teal-50/40 p-6 sm:p-8 cursor-pointer transition-colors duration-200 hover:border-teal-500 hover:bg-teal-50">
              <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center mb-5 transition-colors duration-200 group-hover:bg-teal-500/30">
                <svg
                  className="w-6 h-6 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-teal-950">
                无法衡量
              </h3>
              <p className="mt-2 text-sm text-teal-900/60 leading-relaxed">
                不知道自己一天真正高效了多久？自动记录每个完成的番茄，量化你的专注产出。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== How it works ========== */}
      <section>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-center text-teal-950">
            三步开始
          </h2>
          <p className="mt-3 text-center text-sm text-teal-900/50 max-w-md mx-auto">
            简单到无需学习，打开即用
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-teal-600 flex items-center justify-center">
                <span className="text-white font-display text-xl font-bold">1</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-teal-950">
                打开页面
              </h3>
              <p className="mt-2 text-sm text-teal-900/60 leading-relaxed">
                无需下载安装，浏览器打开即可使用，macOS 客户端可选
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-teal-600 flex items-center justify-center">
                <span className="text-white font-display text-xl font-bold">2</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-teal-950">
                开始专注
              </h3>
              <p className="mt-2 text-sm text-teal-900/60 leading-relaxed">
                点击开始，进入 25 分钟沉浸式专注，结束后自动记录
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-teal-600 flex items-center justify-center">
                <span className="text-white font-display text-xl font-bold">3</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-teal-950">
                持续积累
              </h3>
              <p className="mt-2 text-sm text-teal-900/60 leading-relaxed">
                查看日历热力图和统计数据，追踪你的专注成长轨迹
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Stats ========== */}
      <section className="bg-teal-600">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                25<span className="text-teal-100 text-xl ml-0.5">min</span>
              </p>
              <p className="mt-2 text-sm text-teal-100/70">标准专注时段</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                100%<span className="text-teal-100 text-xl ml-0.5">free</span>
              </p>
              <p className="mt-2 text-sm text-teal-100/70">永久免费</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                跨平台
              </p>
              <p className="mt-2 text-sm text-teal-100/70">网页 + macOS</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                秒级<span className="text-teal-100 text-xl ml-0.5">同步</span>
              </p>
              <p className="mt-2 text-sm text-teal-100/70">数据云端同步</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-teal-950">
            现在就开始你的第一个番茄
          </h2>
          <p className="mt-3 text-sm text-teal-900/50 max-w-md mx-auto">
            无需注册，打开即用。每天进步一点点。
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="btn btn-cta text-base px-8 py-3.5 rounded-xl inline-flex"
            >
              免费开始使用
            </Link>
          </div>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="mt-auto border-t border-teal-100/40 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-teal-900/40">
            <TomatoIcon className="w-5 h-5" />
            <span>Tomato Clock</span>
          </div>
          <p className="text-xs text-teal-900/30">
            Built with focus. Open source on GitHub.
          </p>
        </div>
      </footer>
    </div>
  );
}
