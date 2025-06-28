'use client';

import { useEffect, useState, useCallback } from 'react';
import ChatWindow from './components/ChatWindow';
import SessionList from './components/SessionList';
import SessionCreateForm from './components/SessionCreateForm';

// 定义会话对象的类型接口
interface Session {
  id: string;
  title: string;
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 新增状态，用于显示初始加载

  // 1. 【核心函数】创建并激活一个新会话
  // 使用 useCallback 避免不必要的函数重渲染
  const handleCreateNewSession = useCallback(async () => {
    if (isCreating) return; // 防止重复点击
    setIsCreating(true);

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "新对话" }),
      });

      if (!res.ok) {
        throw new Error("创建新会话失败");
      }

      const newSession: Session = await res.json();
      
      // 关键步骤：在状态中添加新会话，并立即将其设为激活状态
      setSessions(prevSessions => [newSession, ...prevSessions]);
      setActiveSessionId(newSession.id);

    } catch (error) {
      console.error("创建会话时出错:", error);
      // 可以在此向用户显示错误提示
    } finally {
      setIsCreating(false);
    }
  }, [isCreating]); // 依赖 isCreating 状态

  // 2. 【页面加载逻辑】在页面首次加载时运行
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/sessions');
        if (!res.ok) {
          throw new Error('获取会话列表失败');
        }
        const existingSessions: Session[] = await res.json();

        if (existingSessions.length > 0) {
          // 如果存在历史会话，则加载它们并激活第一个
          setSessions(existingSessions);
          setActiveSessionId(existingSessions[0].id);
        } else {
          // 如果没有任何历史会话，则自动创建一个新的
          await handleCreateNewSession();
        }
      } catch (error) {
        console.error("初始化页面失败:", error);
        // 如果加载失败，也可以尝试创建一个新会话作为备用方案
        await handleCreateNewSession();
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 此 effect 仅在组件挂载时运行一次

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] flex bg-white rounded-2xl shadow-lg border overflow-hidden">
        
        <aside className="w-72 border-r p-4 flex-col hidden md:flex bg-gray-50/50">
          <SessionCreateForm 
            onCreate={handleCreateNewSession} 
            isCreating={isCreating} 
          />
          <SessionList
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
          />
        </aside>
        
        <section className="flex-1 flex flex-col">
          {/* 根据加载状态和是否存在激活会话来决定显示内容 */}
          {isLoading ? (
            <div className="flex items-center justify-center flex-1 text-gray-500">
              正在初始化...
            </div>
          ) : activeSessionId ? (
            <ChatWindow key={activeSessionId} sessionId={activeSessionId} />
          ) : (
            <div className="flex items-center justify-center flex-1 text-gray-500">
              无法加载或创建会话。请检查网络连接或刷新页面。
            </div>
          )}
        </section>

      </div>
    </main>
  );
}