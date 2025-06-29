// 文件路径: src/app/components/SessionList.tsx
"use client";
import React from "react";

// 定义会话对象接口
interface Session {
  id: string;
  title: string;
}

// 定义 Props 接口，新增 onDeleteSession 回调
interface Props {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void; // 新增：删除会话的回调函数
}

// 删除按钮的 SVG 图标组件
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);


const SessionList = ({ sessions, activeSessionId, onSelectSession, onDeleteSession }: Props) => {
  
  // 处理删除按钮点击事件的函数
  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // 关键：阻止事件冒泡，防止点击删除时触发父按钮的 onSelectSession
    if (window.confirm("确定要删除这个会话吗？此操作不可撤销。")) {
      onDeleteSession(sessionId);
    }
  };

  return (
    <div className="space-y-2 overflow-y-auto flex-1">
      <h2 className="text-lg font-semibold text-gray-700">最近对话</h2>
      <ul className="space-y-1">
        {sessions.map((session) => (
          // 在 li 上添加 relative 和 group，为绝对定位的删除按钮做准备
          <li key={session.id} className="relative group">
            <button
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left p-2 rounded-md truncate pr-8 ${ // 增加右侧内边距，为删除按钮留出空间
                session.id === activeSessionId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {session.title}
            </button>
            {/* 删除按钮：默认透明，当鼠标悬停在 li (group) 上时变为不透明 */}
            <button
              onClick={(e) => handleDelete(e, session.id)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
              title="删除会话"
            >
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionList;