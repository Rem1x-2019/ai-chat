// 文件路径: src/app/api/chat/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { checkLimit } from "@/lib/limit";
import { streamChatWithProvider } from "@/lib/deepseek";
import { OpenAIStream, StreamingTextResponse } from 'ai';

export async function POST(req: Request) {
  const { messages, provider, sessionId } = await req.json();
  
  // 1. 用户身份验证和额度检查
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  let userId: string | undefined = session?.user?.id;
  if (!userId) {
    let guestId = cookieStore.get("guest_id")?.value;
    if (!guestId) {
      guestId = crypto.randomUUID();
      cookieStore.set("guest_id", guestId, { maxAge: 60 * 60 * 24 * 30 });
    }
    userId = `guest-${guestId}`;
  }
  const isGuest = !session?.user?.id;

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, isGuest },
  });

  const limitOk = await checkLimit(userId);
  if (!limitOk) {
    return new Response("您已达到每日消息上限。", { status: 429 });
  }

  // 2. 保存用户消息
  const userMessage = messages[messages.length - 1];
  await prisma.message.create({
    data: { sessionId, role: 'user', content: userMessage.content },
  });

  // 3. 决定使用的模型
  let finalProvider = provider;
  if (!finalProvider || finalProvider === 'default') {
    const defaultConfig = await prisma.systemConfig.findUnique({ where: { key: 'default_model' } });
    finalProvider = defaultConfig?.value || 'deepseek';
  }

  // 4. 获取并返回流
  try {
    const stream = await streamChatWithProvider(finalProvider, messages);
    
    // 使用 'ai' 包的 Vercel AI SDK 来处理流
    const aiStream = OpenAIStream(new Response(stream), {
      async onCompletion(completion) {
        // 当流结束时，将完整的 AI 回复存入数据库
        await prisma.message.create({
          data: {
            sessionId,
            role: 'assistant',
            content: completion,
          }
        });
      }
    });

    return new StreamingTextResponse(aiStream);
  } catch (error) {
    console.error("AI API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "从 AI 服务获取响应失败。";
    return new Response(errorMessage, { status: 500 });
  }
}