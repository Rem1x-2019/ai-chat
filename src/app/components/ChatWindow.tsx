// 文件路径: src/app/components/ChatWindow.tsx
'use client';

import { useChat } from 'ai/react';
import { useEffect, useState, useRef, FormEvent } from 'react';
import MessageBubble from './MessageBubble';
import type { Message } from 'ai/react';
import { useSessionStore } from '@/stores/sessionStore'; // 引入 Zustand store

type ChatWindowProps = {
  sessionId: string;
};

export default function ChatWindow({ sessionId }: ChatWindowProps) {
  // 从 store 中获取更新标题的 action
  const updateSessionTitle = useSessionStore((state) => state.updateSessionTitle);
  
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [selectedModel, setSelectedModel] = useState('default');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoadingInitial(true);
      try {
        const res = await fetch(`/api/messages?sessionId=${sessionId}`);
        if (res.ok) setInitialMessages(await res.json());
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
    body: { sessionId },
    initialMessages: initialMessages,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input || isLoading) return;

    const userMessageContent = input;
    // 使用 useChat 返回的 messages 状态来判断是否是第一条用户消息
    const isFirstUserMessage = messages.filter(m => m.role === 'user').length === 0;
    
    // 使用 useChat 的 handleSubmit 发送消息，并附带 provider 信息
    originalHandleSubmit(e, {
      options: { body: { provider: selectedModel } }
    });

    if (isFirstUserMessage) {
      // 这是一个“即发即忘”的请求，不 await 它，以免阻塞 UI
      fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstMessage: userMessageContent }),
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('自动命名失败');
      })
      .then(updatedSession => {
        if (updatedSession.title) {
          // 成功后，调用 store 的 action 更新全局状态
          updateSessionTitle(sessionId, updatedSession.title);
        }
      })
      .catch(error => console.error(error));
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
          <MessageBubble key={m.id} role={m.role as 'user' | 'assistant'} content={m.content} />
        ))}
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