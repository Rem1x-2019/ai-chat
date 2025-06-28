import { chatWithOpenAI } from "@/lib/openai";
import { chatWithDeepSeek } from "@/lib/deepseek";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { checkLimit } from "@/lib/limit"; // 引入每日限制检查函数

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();

  let userId: string | undefined = session?.user?.id;
  let isGuest = false;

  // 如果用户未登录，则处理为游客
  if (!userId) {
    let guestId = cookieStore.get("guest_id")?.value;
    if (!guestId) {
      // 如果 Cookie 中没有游客 ID，则创建一个新的
      guestId = crypto.randomUUID();
      cookieStore.set("guest_id", guestId, { maxAge: 60 * 60 * 24 * 30 }); // 设置 30 天有效期
    }
    userId = `guest-${guestId}`; // 游客 ID 加上前缀以作区分
    isGuest = true;
  }

  // 确保数据库中有该用户（无论是登录用户还是游客）的记录
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, isGuest: isGuest },
  });

  // 检查用户的每日消息限制
  const limitOk = await checkLimit(userId);
  if (!limitOk) {
    // 如果超出限制，返回 429 Too Many Requests 错误
    return new Response("您已达到每日消息上限。", { status: 429 });
  }

  const body = await req.json();
  const { messages, provider = "openai", sessionId } = body;

  if (!sessionId) {
    return new Response("会话 ID 是必需的", { status: 400 });
  }

  // 从消息数组中获取最后一条，即用户刚刚发送的消息
  const userMessage = messages[messages.length - 1];
  // 将用户的消息存入数据库
  await prisma.message.create({
    data: {
      sessionId,
      role: 'user',
      content: userMessage.content,
    }
  });

  // 调用 AI 服务获取回复
  let replyContent: string;
  try {
    if (provider === "deepseek") {
      replyContent = await chatWithDeepSeek(messages);
    } else {
      replyContent = await chatWithOpenAI(messages);
    }
  } catch (error) {
    console.error("AI API Error:", error);
    return new Response("从 AI 服务获取响应失败。", { status: 500 });
  }

  // 将 AI 的回复存入数据库
  await prisma.message.create({
    data: {
      sessionId,
      role: 'assistant',
      content: replyContent,
    }
  });

  // 将 AI 回复返回给前端
  return new Response(JSON.stringify({ reply: replyContent }), {
    headers: { "Content-Type": "application/json" },
  });
}