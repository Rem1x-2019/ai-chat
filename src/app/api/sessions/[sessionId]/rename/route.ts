// 文件路径: src/app/api/sessions/[sessionId]/rename/route.ts
import { prisma } from "@/lib/db";
import { chatWithOpenAI } from "@/lib/openai";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  const { firstMessage } = await req.json();

  if (!sessionId || !firstMessage) {
    return new Response("Session ID and first message are required", { status: 400 });
  }

  try {
    const summaryPrompt = `
      根据以下用户问题，为此段对话生成一个简洁的、不超过8个字的标题。
      直接返回标题文本，不要包含任何多余的解释、前缀或引号。
      用户问题: "${firstMessage}"
    `;
    
    const title = await chatWithOpenAI([{ role: 'user', content: summaryPrompt }]);

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { title: title.replace(/["'“”]/g, "").trim() },
    });

    return new Response(JSON.stringify(updatedSession), { status: 200 });
  } catch (error) {
    console.error("Failed to rename session:", error);
    return new Response("Internal server error", { status: 500 });
  }
}