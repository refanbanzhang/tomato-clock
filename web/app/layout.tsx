import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "番茄时钟 - Tomato Clock",
  description: "一个简洁高效的番茄工作法计时器",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-stone-50">{children}</body>
    </html>
  );
}
