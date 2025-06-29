// 文件路径: src/app/layout.tsx
import "./styles/globals.css";
import { ReactNode } from "react";
import AuthProvider from "./components/AuthProvider"; // 引入 AuthProvider

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <AuthProvider> {/* 添加 AuthProvider */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}