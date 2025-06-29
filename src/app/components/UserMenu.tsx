// 文件路径: src/app/components/UserMenu.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (status === 'loading') {
    return <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />;
  }

  if (session) {
    return (
      <div className="relative">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Image
            src={session.user?.image || '/favicon.svg'}
            alt={session.user?.name || 'User Avatar'}
            width={40}
            height={40}
            className="rounded-full border-2 border-slate-300 hover:border-blue-500 transition-all"
          />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-10 border border-slate-200">
            <div className="px-4 py-2 border-b">
              <p className="font-semibold text-sm truncate">{session.user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
            </div>
            <div className="px-4 py-2 text-sm text-slate-600">
              <p>今日剩余额度: 20/20</p> {/* TODO: 动态获取额度 */}
            </div>
            <a href="/admin" className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
              管理后台
            </a>
            <button
              onClick={() => signOut()}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
            >
              退出登录
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 transition-colors"
    >
      使用 GitHub 登录
    </button>
  );
}