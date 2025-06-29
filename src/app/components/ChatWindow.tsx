// 文件路径: src/app/components/ChatWindow.tsx
'use client';

import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from 'react';
import MessageBubble from './MessageBubble';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type ChatWindowProps = {
  sessionId: string;
};

export default function ChatWindow({ sessionId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!sessionId) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("获取历史消息失败:", error);
      }
    };
    fetchMessages();
  }, [sessionId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = inputRef.current?.value.trim();

    if (!text || isLoading || !inputRef.current) return;

    // 检查这是否是会话中的第一条用户消息
    const isFirstUserMessage = messages.filter(m => m.role === 'user').length === 0;

    const userInput = inputRef.current.value;
    inputRef.current.value = '';

    const tempUserMessage: Message = { id: `temp-user-${Date.now()}`, role: 'user', content: userInput };
    setMessages(prev => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userInput }],
          sessionId,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'API 请求失败');
      }

      const data = await res.json();
      const assistantMessage: Message = { id: `assistant-${Date.now()}`, role: 'assistant', content: data.reply };
      
      setMessages(prev => {
          const newMessages = prev.filter(m => m.id !== tempUserMessage.id);
          return [...newMessages, { ...tempUserMessage, id: `user-${Date.now()}` }, assistantMessage];
      });

      // 如果是第一条用户消息，则在获取回复后，触发自动命名
      if (isFirstUserMessage) {
        // "即发即忘" 请求，不阻塞主流程
        // TODO: 为了让侧边栏标题实时更新，需要一个全局状态管理方案或回调
        fetch(`/api/sessions/${sessionId}/rename`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstMessage: text }),
        });
      }

    } catch (error) {
      const errorMessageContent = error instanceof Error ? error.message : 'Unknown error';
      const errorMessage: Message = { id: `error-${Date.now()}`, role: 'assistant', content: `错误: ${errorMessageContent}` };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]); // 替换临时消息为错误消息
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4 overflow-y-auto mb-4 p-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isLoading && <MessageBubble role="assistant" content="正在思考中..." />}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-auto flex p-2 border-t border-slate-200/80">
        <input
          ref={inputRef}
          type="text"
          disabled={isLoading}
          className="flex-1 border p-2 rounded-l-lg outline-none disabled:bg-gray-100"
          placeholder="输入你的消息..."
          onKeyDown={handleKeyDown}
        />
        <button type="submit" disabled={isLoading} className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300">
          发送
        </button>
      </form>
    </div>
  );
}