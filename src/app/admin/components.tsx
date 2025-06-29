// 文件路径: src/app/admin/components.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { upsertApiService, updateUserLimit, deleteUser } from './actions';
import { useEffect } from 'react';

// 通用的提交按钮，可以显示 pending 状态
function SubmitButton({ children, variant = 'primary' }: { children: React.ReactNode, variant?: 'primary' | 'danger' }) {
  const { pending } = useFormStatus();
  
  const baseClasses = "px-3 py-1 text-white text-sm rounded-md transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300",
    danger: "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
  };

  return (
    <button type="submit" disabled={pending} className={`${baseClasses} ${variantClasses[variant]}`}>
      {pending ? '处理中...' : children}
    </button>
  );
}

// API 服务管理表单
export function ApiServiceForm({ service }: { service: any }) {
  // useFormState 用于处理表单提交后的状态（如成功/错误消息）
  const [state, formAction] = useFormState(upsertApiService, { message: null, error: null });

  useEffect(() => {
    if (state.message) alert(state.message);
    if (state.error) alert(`错误: ${state.error}`);
  }, [state]);

  return (
    <form action={formAction} className="p-4 border rounded-lg space-y-2 bg-slate-50">
      <input type="hidden" name="id" value={service.id} />
      <h3 className="font-bold text-lg">{service.name} (使用次数: {service.usageCount})</h3>
      <div>
        <label htmlFor={`apiKey-${service.id}`} className="block text-sm font-medium text-slate-600">API Key</label>
        <input id={`apiKey-${service.id}`} name="apiKey" defaultValue={service.apiKey} className="w-full p-1 border rounded" type="password" />
      </div>
      <div>
        <label htmlFor={`baseUrl-${service.id}`} className="block text-sm font-medium text-slate-600">Base URL</label>
        <input id={`baseUrl-${service.id}`} name="baseUrl" defaultValue={service.baseUrl || ''} className="w-full p-1 border rounded" />
      </div>
      <div>
        <label htmlFor={`model-${service.id}`} className="block text-sm font-medium text-slate-600">Model Name</label>
        <input id={`model-${service.id}`} name="model" defaultValue={service.model || ''} className="w-full p-1 border rounded" />
      </div>
      <SubmitButton>更新</SubmitButton>
    </form>
  );
}

// 用户管理列表项
export function UserForm({ user }: { user: any }) {
  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div>
        <p className="font-semibold truncate w-40" title={user.name || user.email || user.id}>{user.name || user.email || '游客'}</p>
        <p className="text-xs text-slate-500">{user.id}</p>
      </div>
      
      {/* 更新用户额度的表单 */}
      <form action={async (formData) => {
        const newLimit = parseInt(formData.get('limit') as string, 10);
        await updateUserLimit(user.id, newLimit);
        alert(`用户 ${user.id} 的额度已更新。`);
      }} className="flex items-center space-x-2">
        <input name="limit" type="number" defaultValue={user.messageLimit} className="w-16 p-1 border rounded text-center" />
        <SubmitButton>保存</SubmitButton>
      </form>

      {/* 删除用户的表单 */}
      <form action={async () => {
        if (window.confirm(`确定要删除用户 ${user.id} 吗？此操作不可撤销。`)) {
            const result = await deleteUser(user.id);
            alert(result.message);
        }
      }}>
        <SubmitButton variant="danger">删除</SubmitButton>
      </form>
    </div>
  );
}