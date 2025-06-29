// 文件路径: src/app/api/chat/route.ts

// 移除了 chatWithOpenAI 和 chatWithDeepSeek 的直接导入
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { checkLimit } from "@/lib/limit";
// 引入新的通用函数，我们将把它放在 deepseek.ts 文件中
import { chatWithProvider } from "@/lib/deepseek"; 

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();

  let userId: string | undefined = session?.user?.id;
  let isGuest = false;

  // 如果用户未登录，则处理为游客
  if (!userId) {
    let guestId = cookieStore.get("guest_id")?.value;
    if (!guestId) {
      guestId = crypto.randomUUID();
      cookieStore.set("guest_id", guestId, { maxAge: 60 * 60 * 24 * 30 });
    }
    userId = `guest-${guestId}`;
    isGuest = true;
  }

  // 确保数据库中有该用户记录
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, isGuest: isGuest },
  });

  // 检查用户的每日消息限制
  const limitOk = await checkLimit(userId);
  if (!limitOk) {
    return new Response("您已达到每日消息上限。", { status: 429 });
  }

  // 从数据库获取默认模型设置
  const defaultConfig = await prisma.systemConfig.findUnique({
    where: { key: 'default_model' },
  });
  const defaultModel = defaultConfig?.value || 'deepseek';

  const body = await req.json();
  // 如果前端没有提供 provider，则使用从数据库读取的默认值
  const { messages, provider = defaultModel, sessionId } = body;

  if (!sessionId) {
    return new Response("会话 ID 是必需的", { status: 400 });
  }

  // 保存用户消息
  const userMessage = messages[messages.length - 1];
  await prisma.message.create({
    data: {
      sessionId,
      role: 'user',
      content: userMessage.content,
    }
  });

  // 调用AI服务获取回复
  let replyContent: string;
  try {
    // 【核心修改】现在统一使用 chatWithProvider 函数
    replyContent = await chatWithProvider(provider, messages);
  } catch (error) {
    console.error("AI API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "从 AI 服务获取响应失败。";
    return new Response(errorMessage, { status: 500 });
  }

  // 保存AI回复
  await prisma.message.create({
    data: {
      sessionId,
      role: 'assistant',
      content: replyContent,
    }
  });

  // 返回响应
  return new Response(JSON.stringify({ reply: replyContent }), {
    headers: { "Content-Type": "application/json" },
  });
}