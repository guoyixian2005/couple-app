import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "情侣聊天应用",
  description: "专属于你们的甜蜜空间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
