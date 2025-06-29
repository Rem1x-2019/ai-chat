// 文件路径: src/app/components/ChatWindow.tsx
'use client';

import { useChat } from 'ai/react';
import { useEffect, useState, useRef, FormEvent } from 'react';
import MessageBubble from './MessageBubble';
import type { Message } from 'ai/react';

type ChatWindowProps = {
  sessionId: string;
  onTitleUpdate: (sessionId: string, newTitle: string) => void; // 接收回调函数
};

export default function ChatWindow({ sessionId, onTitleUpdate }: ChatWindowProps) {
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [selectedModel, setSelectedModel] = useState('default');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取历史消息
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoadingInitial(true);
      try {
        const res = await fetch(`/api/messages?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setInitialMessages(data);
        }
      } catch (error) {
        console.error("获取历史消息失败:", error);
      } finally {
        setIsLoadingInitial(false);
      }
    };
    fetchMessages();
  }, [sessionId]);

  const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { sessionId, provider: selectedModel },
    initialMessages: initialMessages,
  });

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // 封装我们自己的 handleSubmit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input || isLoading) return;

      const userMessageContent = input;
      // 检查这是否是会话中的第一条用户消息
      const isFirstUserMessage = messages.filter(m => m.role === 'user').length === 0;
      
      // 使用 useChat 的 handleSubmit 来处理消息发送和流式更新
      originalHandleSubmit(e);

      // 在消息发送后（不等待回复），立即检查是否需要自动命名
      if (isFirstUserMessage) {
        try {
          const res = await fetch(`/api/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstMessage: userMessageContent }),
          });
          if (res.ok) {
            const updatedSession = await res.json();
            // 调用父组件的回调函数，更新侧边栏的标题
            onTitleUpdate(sessionId, updatedSession.title);
          }
        } catch (error) {
          console.error("自动命名失败:", error);
        }
      }
  }

  if (isLoadingInitial) {
    return <div className="flex items-center justify-center h-full text-slate-500">加载历史消息...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-slate-200/80">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="text-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="default">默认模型</option>
          <option value="deepseek">DeepSeek</option>
          <option value="openai">OpenAI</option>
        </select>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto mb-4 p-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role as any} content={m.content} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="mt-auto flex p-2 border-t border-slate-200/80">
        <input
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
          className="flex-1 border p-2 rounded-l-lg outline-none disabled:bg-gray-100"
          placeholder="输入你的消息..."
        />
        <button type="submit" disabled={isLoading} className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300">
          {isLoading ? '...' : '发送'}
        </button>
      </form>
    </div>
  );
}