// 文件路径: src/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { getSystemConfig, setSystemConfig, getApiServices, upsertApiService, getUsers, updateUserLimit } from './actions';

// 从环境变量读取管理员邮箱
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);

// --- 子组件定义 ---

// API 服务管理表单
async function ApiServiceManager() {
  const services = await getApiServices();
  return (
    <div className="space-y-4">
      {services.map(service => (
        <form key={service.id} action={upsertApiService} className="p-4 border rounded-lg space-y-2 bg-slate-50">
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
          <button type="submit" className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">更新</button>
        </form>
      ))}
    </div>
  );
}

// 用户管理列表
async function UserManager() {
  const users = await getUsers();
  return (
    <div className="space-y-2">
      {users.map(user => (
        <form key={user.id} action={async (formData) => {
          'use server';
          const newLimit = parseInt(formData.get('limit') as string, 10);
          await updateUserLimit(user.id, newLimit);
        }} className="flex items-center justify-between p-2 border rounded-lg bg-slate-50">
          <div>
            <p className="font-semibold truncate w-48" title={user.name || user.email || user.id}>{user.name || user.email || '游客'}</p>
            <p className="text-xs text-slate-500">{user.id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <input name="limit" type="number" defaultValue={user.messageLimit} className="w-16 p-1 border rounded text-center" />
            <button type="submit" className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">保存</button>
          </div>
        </form>
      ))}
    </div>
  );
}

// 【修复点】确保这个组件是一个合法的 React 服务器组件，它必须返回 JSX。
async function ModelSettingsForm() {
  const defaultModel = await getSystemConfig('default_model') || 'deepseek';

  return (
    <form action={async (formData) => {
      'use server';
      const newDefaultModel = formData.get('defaultModel') as string;
      if (newDefaultModel) {
        await setSystemConfig('default_model', newDefaultModel);
      }
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


// --- 主页面组件 ---
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/"); 
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">管理后台</h1>
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