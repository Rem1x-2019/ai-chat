// 文件路径: src/app/layout.tsx

// 修正了导入路径：从 './app/styles/globals.css' 改为 './styles/globals.css'
import "./styles/globals.css"; 
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}