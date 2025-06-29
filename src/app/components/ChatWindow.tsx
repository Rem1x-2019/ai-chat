// 文件路径: src/app/components/ChatWindow.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import { useChat } from 'ai/react';
import type { Message } from 'ai/react';

type ChatWindowProps = {
  sessionId: string;
};

export default function ChatWindow({ sessionId }: ChatWindowProps) {
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

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { sessionId, provider: selectedModel },
    initialMessages: initialMessages,
  });

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoadingInitial) {
    return <div className="flex items-center justify-center h-full">加载历史消息...</div>;
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
          <MessageBubble key={m.id} role={m.role as 'user' | 'assistant'} content={m.content} />
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