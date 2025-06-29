// 文件路径: src/app/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import ChatWindow from './components/ChatWindow';
import SessionList from './components/SessionList';
import SessionCreateForm from './components/SessionCreateForm';
import UserMenu from './components/UserMenu';

interface Session {
  id: string;
  title: string;
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
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
      const newSession: Session = await res.json();
      setSessions(prevSessions => [newSession, ...prevSessions]);
      setActiveSessionId(newSession.id);
    } catch (error) {
      console.error("创建会话时出错:", error);
    } finally {
      setIsCreating(false);
    }
  }, [isCreating]);

  // 新增：处理会话删除的函数
  const handleDeleteSession = async (sessionIdToDelete: string) => {
    // 乐观更新：立即从前端状态中移除会话，以获得即时反馈
    const updatedSessions = sessions.filter(s => s.id !== sessionIdToDelete);
    setSessions(updatedSessions);

    // 如果删除的是当前正激活的会话，则需要决定下一个激活哪个
    if (activeSessionId === sessionIdToDelete) {
      if (updatedSessions.length > 0) {
        // 如果还有其他会话，则激活列表中的第一个
        setActiveSessionId(updatedSessions[0].id);
      } else {
        // 如果这是最后一个会话，则创建一个新的
        await handleCreateNewSession();
      }
    }

    // 在后台发送 API 请求以在数据库中实际删除
    try {
      await fetch(`/api/sessions/${sessionIdToDelete}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("后台删除会话失败:", error);
      // 可选：如果后端删除失败，可以在此恢复前端状态并提示用户
      // fetchSessions(); // 例如，重新获取一次列表以同步状态
    }
  };

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sessions');
      if (!res.ok) throw new Error('获取会话列表失败');
      const existingSessions: Session[] = await res.json();
      if (existingSessions.length > 0) {
        setSessions(existingSessions);
        setActiveSessionId(prev => prev ?? existingSessions[0].id);
      } else {
        await handleCreateNewSession();
      }
    } catch (error) {
      console.error("初始化页面失败:", error);
      if (sessions.length === 0) {
        await handleCreateNewSession();
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleCreateNewSession, sessions.length]);


  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeSessionTitle = sessions.find(s => s.id === activeSessionId)?.title || "聊天";

  return (
    <main className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[95vh] flex bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        
        <aside className="w-72 border-r border-slate-200/80 p-4 flex-col hidden md:flex bg-slate-50/50">
          <SessionCreateForm 
            onCreate={handleCreateNewSession} 
            isCreating={isCreating} 
          />
          <SessionList
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onDeleteSession={handleDeleteSession} // 将删除函数传递给子组件
          />
        </aside>
        
        <section className="flex-1 flex flex-col">
          <header className="flex items-center justify-between p-4 border-b border-slate-200/80">
            <h1 className="text-lg font-semibold text-slate-800 truncate pr-4">
              {activeSessionTitle}
            </h1>
            <UserMenu />
          </header>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                正在初始化...
              </div>
            ) : activeSessionId ? (
              <ChatWindow key={activeSessionId} sessionId={activeSessionId} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                无法加载或创建会话。
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}