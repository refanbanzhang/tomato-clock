import type { Metadata } from "next";
import { Lora, Raleway } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";
import LocaleWrapper from "./components/LocaleWrapper";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tomato Clock - 番茄时钟",
  description: "一个简洁高效的番茄工作法计时器 — A simple and efficient Pomodoro timer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${lora.variable} ${raleway.variable}`} suppressHydrationWarning>
      <head>
        {/* 防止主题闪烁：在 HTML 解析前注入 dark class */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('tomato-clock-theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LocaleWrapper>{children}</LocaleWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
