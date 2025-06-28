// 文件路径: src/app/components/MessageBubble.tsx

"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

// 错误：不应该在这里导入 tailwind.css。全局样式由 layout.tsx 负责。
// import 'tailwindcss/tailwind.css'; // <-- 已移除此行

interface Props {
  role: "user" | "assistant";
  content: string;
}

const MessageBubble = ({ role, content }: Props) => {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        // `prose` 和 `prose-invert` 类来自 @tailwindcss/typography 插件
        // 它们的样式定义在全局的 globals.css 中，所以这里可以直接使用
        className={`px-4 py-2 rounded-lg max-w-2xl prose ${
          isUser
            ? "bg-blue-500 text-white prose-invert rounded-br-none"
            : "bg-gray-200 text-black rounded-bl-none"
        }`}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default MessageBubble;