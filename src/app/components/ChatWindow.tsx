'use client';

import { useEffect, useRef, useState } from 'react';

type ChatWindowProps = {
  sessionId: string;
};

export default function ChatWindow({ sessionId }: ChatWindowProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (text: string) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: text }], sessionId }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, text, data.reply]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputRef.current?.value;
    if (text) {
      sendMessage(text);
      inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 overflow-y-auto">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-3 max-w-lg ${
              idx % 2 === 0 ? 'bg-muted self-end' : 'bg-secondary self-start'
            }`}
          >
            {msg}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 border p-2 rounded-l-xl outline-none"
          placeholder="输入消息..."
        />
        <button type="submit" className="bg-primary text-white px-4 rounded-r-xl">
          发送
        </button>
      </form>
    </div>
  );
}
