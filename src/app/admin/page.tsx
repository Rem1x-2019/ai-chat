// 文件路径: src/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import Link from 'next/link';
import { redirect } from "next/navigation";
import { getSystemConfig, setSystemConfig, getApiServices, getUsers } from './actions';
import { ApiServiceForm, UserForm } from './components';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);

// 默认模型设置表单 (Server Component)
async function ModelSettingsForm() {
  const defaultModel = await getSystemConfig('default_model') || 'deepseek';
  return (
    <form action={async (formData) => {
      'use server';
      const newDefaultModel = formData.get('defaultModel') as string;
      if (newDefaultModel) await setSystemConfig('default_model', newDefaultModel);
      alert('默认模型已更新！');
    }}>
      <div className="space-y-2">
        <label htmlFor="defaultModel" className="block text-sm font-medium text-slate-600">选择默认 AI 模型</label>
        <select
          id="defaultModel"
          name="defaultModel"
          defaultValue={defaultModel}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="deepseek">DeepSeek</option>
          <option value="openai">OpenAI</option>
        </select>
      </div>
      <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">保存设置</button>
    </form>
  );
}

// API 服务管理
async function ApiServiceManager() {
  const services = await getApiServices();
  return (
    <div className="space-y-4">
      {services.map(service => <ApiServiceForm key={service.id} service={service} />)}
    </div>
  );
}

// 用户管理列表
async function UserManager() {
  const users = await getUsers();
  return (
    <div className="space-y-2">
      {users.map(user => <UserForm key={user.id} user={user} />)}
    </div>
  );
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/"); 
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">管理后台</h1>
          <Link href="/" className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-100 transition-colors">
            ← 返回首页
          </Link>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="p-6 bg-white rounded-xl shadow-md border space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-700">API 服务管理</h2>
              <ApiServiceManager />
            </div>
            <hr/>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-700">默认模型设置</h2>
              <ModelSettingsForm />
            </div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md border">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">用户管理</h2>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              <UserManager />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}