import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// 用于获取指定会话的历史消息
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // 在这个应用中，我们允许游客获取他们自己的会话消息。
  // 在一个更严格安全的应用中，可能需要强制用户登录。
  if (!session?.user?.id) {
    // 可以在此添加游客身份验证逻辑
  }

  // 从请求 URL 中获取 sessionId 参数
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response("sessionId is required", { status: 400 });
  }

  // TODO: 添加一个所有权检查，确保用户（无论是登录用户还是游客）只能访问自己的会话。
  // 目前为了简化，暂未实现。

  // 从数据库中查询该会话的所有消息，并按创建时间升序排列
  const messages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });

  return new Response(JSON.stringify(messages), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}