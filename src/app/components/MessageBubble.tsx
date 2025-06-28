"use client";
import React from "react";
import ReactMarkdown from "react-markdown"; // 引入 Markdown 渲染组件
import 'tailwindcss/tailwind.css'; // 引入 Tailwind CSS 以便 prose 插件生效

interface Props {
  role: "user" | "assistant";
  content: string;
}

const MessageBubble = ({ role, content }: Props) => {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        // `prose` 类来自 @tailwindcss/typography 插件，用于美化 Markdown 文本
        className={`px-4 py-2 rounded-lg max-w-2xl prose ${
          isUser
            ? "bg-blue-500 text-white prose-invert rounded-br-none" // prose-invert 用于在深色背景上反转文字颜色
            : "bg-gray-200 text-black rounded-bl-none"
        }`}
      >
        {/* 使用 ReactMarkdown 组件来渲染消息内容 */}
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default MessageBubble;