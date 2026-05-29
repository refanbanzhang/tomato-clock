import type { Metadata, Viewport } from "next";
import { Lora, Raleway } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F97316",
};

export const metadata: Metadata = {
  title: "Tomato Clock - 番茄时钟",
  description: "一个简洁高效的番茄工作法计时器 — A simple and efficient Pomodoro timer",
  appleWebApp: {
    capable: true,
    title: "Tomato Clock",
    statusBarStyle: "black-translucent",
  },
  manifest: "/tomato-clock/manifest.json",
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
          <AuthProvider>
            <LocaleWrapper>{children}</LocaleWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
