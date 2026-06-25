import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LuKK XHS Poster Studio",
  description: "LuKK 的小红书长文卡片排版工具，把 Markdown 长文自动拆成可发布 PNG 卡片。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
