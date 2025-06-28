// 文件路径: src/app/components/ChatWindow.tsx

'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import MessageBubble from './MessageBubble';

// 定义消息对象的正确类型接口
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// 定义组件 Props 的类型接口
type ChatWindowProps = {
  sessionId: string;
};

export default function ChatWindow({ sessionId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // 用于自动滚动

  // 自动滚动到最新消息的函数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 每当消息列表更新时，执行滚动
  useEffect(scrollToBottom, [messages]);

  // 当 sessionId 变化时（即切换会话时），获取该会话的历史消息
  useEffect(() => {
    if (!sessionId) return;
    const fetchMessages = async () => {
      // 这里的 setIsLoading(true) 会被 page.tsx 的 isLoading 覆盖，但保留无妨
      try {
        const res = await fetch(`/api/messages?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        } else {
            setMessages([]); // 如果获取失败，清空消息列表
        }
      } catch (error) {
        console.error("获取历史消息失败:", error);
        setMessages([]); // 出错时也清空
      }
    };
    fetchMessages();
  }, [sessionId]);

  // 处理表单提交（发送消息）
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text || isLoading) return;

    if (inputRef.current) {
      inputRef.current.value = '';
    }

    // 乐观更新：立即将用户消息显示在界面上
    const tempUserMessageId = `temp-user-${Date.now()}`;
    const userMessage: Message = { id: tempUserMessageId, role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 发送包含新消息的完整对话历史
          messages: [...messages.map(m => ({role: m.role, content: m.content})), { role: 'user', content: text }], 
          sessionId
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'API 请求失败');
      }

      const data = await res.json();
      const assistantMessage: Message = { id: `assistant-${Date.now()}`, role: 'assistant', content: data.reply };
      
      // 收到 AI 回复后，更新消息列表
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      const errorMessageContent = error instanceof Error ? error.message : '未知错误';
      const errorMessage: Message = { id: `error-${Date.now()}`, role: 'assistant', content: `错误: ${errorMessageContent}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* 消息显示区域 */}
      <div className="flex-1 space-y-4 overflow-y-auto mb-4 p-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {/* 加载中提示 */}
        {isLoading && <MessageBubble role="assistant" content="正在思考中..." />}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 输入表单 */}
      <form onSubmit={handleSubmit} className="mt-auto flex p-2 border-t">
        <input
          ref={inputRef}
          type="text"
          disabled={isLoading}
          className="flex-1 border p-2 rounded-l-lg outline-none disabled:bg-gray-100"
          placeholder="输入你的消息..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button type="submit" disabled={isLoading} className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300">
          发送
        </button>
      </form>
    </div>
  );
}