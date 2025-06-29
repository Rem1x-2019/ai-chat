// 文件路径: src/app/api/sessions/[sessionId]/route.ts
import { prisma } from "@/lib/db";
import { chatWithOpenAI } from "@/lib/openai";
import { NextRequest } from "next/server";

// TODO: 在所有方法中添加用户身份验证，确保只有会话的所有者才能操作。

/**
 * 处理更新单个会话的 PATCH 请求 (例如，重命名)
 * @param req Next.js 请求对象
 * @param params 从 URL 路径中解析的参数，包含 sessionId
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  const body = await req.json();
  const { title, firstMessage } = body;

  if (!sessionId) {
    return new Response("Session ID is required", { status: 400 });
  }

  let newTitle = title;

  try {
    // 如果请求中包含 firstMessage，则通过 AI 生成标题
    if (firstMessage) {
      const summaryPrompt = `
        根据以下用户问题，为此段对话生成一个简洁的、不超过8个字的标题。
        直接返回标题文本，不要包含任何多余的解释、前缀或引号。
        用户问题: "${firstMessage}"
      `;
      newTitle = await chatWithOpenAI([{ role: 'user', content: summaryPrompt }]);
      newTitle = newTitle.replace(/["'“”]/g, "").trim();
    }

    if (!newTitle) {
      return new Response("A title must be provided or generated.", { status: 400 });
    }

    // 更新数据库中的会话标题
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { title: newTitle },
    });

    return new Response(JSON.stringify(updatedSession), { status: 200 });
  } catch (error) {
    console.error("Failed to update session:", error);
    return new Response("Internal server error", { status: 500 });
  }
}


/**
 * 处理删除单个会话的 DELETE 请求
 * @param req Next.js 请求对象
 * @param params 从 URL 路径中解析的参数，包含 sessionId
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;

  if (!sessionId) {
    return new Response("Session ID is required", { status: 400 });
  }

  try {
    // 使用 Prisma 删除指定的会话。
    // 由于 schema 中设置了 onDelete: Cascade，关联的 Message 也会被删除。
    await prisma.session.delete({
      where: { id: sessionId },
    });

    // 成功删除后，返回 204 No Content
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete session:", error);
    // @ts-ignore
    if (error.code === 'P2025') { // Prisma code for record not found
      return new Response("Session not found", { status: 404 });
    }
    return new Response("Internal server error", { status: 500 });
  }
}