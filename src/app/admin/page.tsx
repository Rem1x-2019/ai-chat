// 文件路径: src/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { getSystemConfig, setSystemConfig, getApiServices, upsertApiService, getUsers, updateUserLimit } from './actions';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);

// API 服务管理表单
async function ApiServiceManager() {
  const services = await getApiServices();
  return (
    <div className="space-y-4">
      {services.map(service => (
        <form key={service.id} action={upsertApiService} className="p-4 border rounded-lg space-y-2">
          <input type="hidden" name="id" value={service.id} />
          <h3 className="font-bold text-lg">{service.name} (使用次数: {service.usageCount})</h3>
          <div>
            <label>API Key</label>
            <input name="apiKey" defaultValue={service.apiKey} className="w-full p-1 border rounded" type="password" />
          </div>
          <div>
            <label>Base URL</label>
            <input name="baseUrl" defaultValue={service.baseUrl || ''} className="w-full p-1 border rounded" />
          </div>
           <div>
            <label>Model Name</label>
            <input name="model" defaultValue={service.model || ''} className="w-full p-1 border rounded" />
          </div>
          <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">更新</button>
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
        }} className="flex items-center justify-between p-2 border rounded-lg">
          <div>
            <p className="font-semibold truncate w-48">{user.name || user.email || '游客'}</p>
            <p className="text-xs text-slate-500">{user.id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <input name="limit" type="number" defaultValue={user.messageLimit} className="w-16 p-1 border rounded" />
            <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">保存</button>
          </div>
        </form>
      ))}
    </div>
  );
}

// 默认模型设置
async function ModelSettingsForm() {
  // ... 保持不变
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) redirect("/"); 

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">管理后台</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="p-6 bg-white rounded-xl shadow border space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-700">API 服务管理</h2>
              <ApiServiceManager />
            </div>
             <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-700">默认模型设置</h2>
              <ModelSettingsForm />
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">用户管理</h2>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <UserManager />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}