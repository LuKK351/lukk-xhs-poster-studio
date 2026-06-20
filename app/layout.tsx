import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XHS Poster Studio",
  description: "把短文自动排成可发布的小红书/小绿书卡片"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
