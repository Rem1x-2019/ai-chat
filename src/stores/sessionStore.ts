// 文件路径: src/stores/sessionStore.ts
import { create } from 'zustand';

// 定义会话和 store 的类型
interface Session {
  id: string;
  title: string;
}

interface SessionState {
  sessions: Session[];
  activeSessionId: string | null;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, newTitle: string) => void;
  setActiveSessionId: (sessionId: string | null) => void;
}

// 创建 store
export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  activeSessionId: null,
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
  deleteSession: (sessionId) => set((state) => ({
    sessions: state.sessions.filter((s) => s.id !== sessionId),
  })),
  updateSessionTitle: (sessionId, newTitle) => set((state) => ({
    sessions: state.sessions.map((s) =>
      s.id === sessionId ? { ...s, title: newTitle } : s
    ),
  })),
  setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),
}));