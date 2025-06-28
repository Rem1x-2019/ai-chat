"use client";
import React from "react";

// 定义会话对象接口
interface Session {
  id: string;
  title: string;
}

// 定义 Props 接口
interface Props {
  sessions: Session[];
  activeSessionId: string | null; // 当前激活的会话 ID
  onSelectSession: (id: string) => void; // 选择会话时的回调函数
}

const SessionList = ({ sessions, activeSessionId, onSelectSession }: Props) => {
  return (
    <div className="space-y-2 overflow-y-auto flex-1">
      <h2 className="text-lg font-semibold text-gray-700">最近对话</h2>
      <ul className="space-y-1">
        {sessions.map((session) => (
          <li key={session.id}>
            <button
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left p-2 rounded-md truncate ${
                // 根据是否为激活会话，应用不同的样式
                session.id === activeSessionId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {session.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionList;