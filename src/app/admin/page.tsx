// 文件路径: src/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";

// 从环境变量读取管理员邮箱列表，并过滤掉空值
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // 权限检查：如果用户未登录，或其邮箱不在管理员列表中，则重定向
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/"); 
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">管理后台</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">API 管理</h2>
            <p className="text-sm text-slate-600">
              API Keys 当前通过环境变量进行管理。为确保安全，请直接在 Vercel 的项目设置仪表盘中进行修改。
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">用户管理</h2>
            <p className="text-sm text-slate-600">用户列表、额度修改等功能待开发。</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">系统状态</h2>
            <p className="text-sm text-slate-600">系统运行正常。</p>
          </div>

        </div>
      </div>
    </div>
  );
}