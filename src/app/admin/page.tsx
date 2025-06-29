// 文件路径: src/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { getSystemConfig, setSystemConfig } from './actions';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);

// 新建一个服务器组件来处理表单交互
async function ModelSettingsForm() {
  const defaultModel = await getSystemConfig('default_model') || 'deepseek';

  return (
    <form action={async (formData) => {
      'use server';
      const newDefaultModel = formData.get('defaultModel') as string;
      await setSystemConfig('default_model', newDefaultModel);
    }}>
      <div className="space-y-2">
        <label htmlFor="defaultModel" className="block text-sm font-medium text-slate-600">
          选择默认 AI 模型
        </label>
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
      <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        保存设置
      </button>
    </form>
  );
}


export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/"); 
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">管理后台</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">默认模型设置</h2>
            <ModelSettingsForm />
          </div>

          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">API 管理</h2>
            <p className="text-sm text-slate-600">
              API Keys 通过 Vercel 环境变量进行管理。
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">用户管理</h2>
            <p className="text-sm text-slate-600">用户列表、额度修改等功能待开发。</p>
          </div>

        </div>
      </div>
    </div>
  );
}