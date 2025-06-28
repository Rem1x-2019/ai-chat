import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

// 辅助函数，用于获取当前用户（登录用户或游客）的 ID
async function getUserId() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { userId: session.user.id, isGuest: false };
  }

  // 处理游客
  const cookieStore = cookies();
  let guestId = cookieStore.get("guest_id")?.value;
  if (!guestId) {
    guestId = crypto.randomUUID();
    cookieStore.set("guest_id", guestId, { maxAge: 60 * 60 * 24 * 30 });
  }
  const userId = `guest-${guestId}`;
  return { userId, isGuest: true };
}

// GET 请求处理：获取当前用户的所有会话列表 (此部分逻辑正确，无需修改)
export async function GET() {
  try {
    const { userId } = await getUserId();
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return new Response(JSON.stringify(sessions), { status: 200 });
  } catch (error) {
    console.error("GET /api/sessions Error:", error);
    return new Response("获取会话失败", { status: 500 });
  }
}

// POST 请求处理：为当前用户创建一个新的会话 (使用事务进行重构)
export async function POST(req: Request) {
  try {
    const { userId, isGuest } = await getUserId();
    const body = await req.json();
    const { title } = body;

    // --- 使用 Prisma 事务来保证数据一致性 ---
    // $transaction 会确保内部的所有数据库操作要么全部成功，要么全部失败。
    const newSession = await prisma.$transaction(async (tx) => {
      // 步骤 1: 在事务内，确保用户存在。
      // 使用 `tx` (事务客户端) 而不是 `prisma`
      await tx.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, isGuest },
      });

      // 步骤 2: 在同一个事务内，创建新的会话。
      // 因为上一步已经确保用户存在，这一步的外键约束将永远不会失败。
      const session = await tx.session.create({
        data: {
          title: title || "新对话",
          userId: userId,
        },
      });

      return session;
    });
    // --- 事务结束 ---

    return new Response(JSON.stringify(newSession), { status: 201 });

  } catch (error) {
    // 捕获并记录任何在事务中或在事务外发生的错误
    console.error("POST /api/sessions Error:", error);
    // 向客户端返回一个明确的 500 错误
    return new Response("创建会话时服务器发生内部错误", { status: 500 });
  }
}