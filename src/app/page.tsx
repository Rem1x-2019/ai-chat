// 文件路径: src/app/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import ChatWindow from './components/ChatWindow';
import SessionList from './components/SessionList';
import SessionCreateForm from './components/SessionCreateForm';
import UserMenu from './components/UserMenu';
import { useSessionStore } from '@/stores/sessionStore'; // 引入 Zustand store

export default function Home() {
  // 从全局 store 获取状态和操作函数
  const { 
    sessions, 
    activeSessionId, 
    setSessions, 
    addSession,
    deleteSession,
    updateSessionTitle,
    setActiveSessionId 
  } = useSessionStore();

  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleCreateNewSession = useCallback(async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "新对话" }),
      });
      if (!res.ok) throw new Error("创建新会话失败");
      const newSession = await res.json();
      addSession(newSession); // 使用 store 的 action
      setActiveSessionId(newSession.id); // 使用 store 的 action
    } catch (error) {
      console.error("创建会话时出错:", error);
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, addSession, setActiveSessionId]);

  const handleDeleteSession = async (sessionIdToDelete: string) => {
    const originalSessions = sessions;
    deleteSession(sessionIdToDelete); // 使用 store 的 action

    if (activeSessionId === sessionIdToDelete) {
      const remainingSessions = originalSessions.filter(s => s.id !== sessionIdToDelete);
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id);
      } else {
        await handleCreateNewSession();
      }
    }
    try {
      await fetch(`/api/sessions/${sessionIdToDelete}`, { method: 'DELETE' });
    } catch (error) {
      console.error("后台删除会话失败:", error);
      setSessions(originalSessions); // 如果失败，恢复状态
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/sessions');
        if (!res.ok) throw new Error('获取会话列表失败');
        const existingSessions = await res.json();
        if (existingSessions.length > 0) {
          setSessions(existingSessions);
          if (useSessionStore.getState().activeSessionId === null) {
            setActiveSessionId(existingSessions[0].id);
          }
        } else {
          await handleCreateNewSession();
        }
      } catch (error) {
        console.error("初始化页面失败:", error);
        if (useSessionStore.getState().sessions.length === 0) {
          await handleCreateNewSession();
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 仅在挂载时运行

  const activeSessionTitle = sessions.find(s => s.id === activeSessionId)?.title || "聊天";

  return (
    <main className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[95vh] flex bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        <aside className="w-72 border-r border-slate-200/80 p-4 flex-col hidden md:flex bg-slate-50/50">
          <SessionCreateForm onCreate={handleCreateNewSession} isCreating={isCreating} />
          <SessionList
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId} // 直接使用 store 的 action
            onDeleteSession={handleDeleteSession}
          />
        </aside>
        <section className="flex-1 flex flex-col">
          <header className="flex items-center justify-between p-4 border-b border-slate-200/80">
            <h1 className="text-lg font-semibold text-slate-800 truncate pr-4">{activeSessionTitle}</h1>
            <UserMenu />
          </header>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-slate-500">正在初始化...</div>
            ) : activeSessionId ? (
              <ChatWindow key={activeSessionId} sessionId={activeSessionId} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">无法加载或创建会话。</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}