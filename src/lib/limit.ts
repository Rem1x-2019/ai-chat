// 文件路径: src/lib/limit.ts
import { prisma } from "./db";

export async function checkLimit(userId: string): Promise<boolean> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // 1. 获取用户的额度设置
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { messageLimit: true },
  });

  // 如果找不到用户，或额度为0，则拒绝
  if (!user || user.messageLimit <= 0) {
    return false;
  }

  const limitAmount = user.messageLimit;

  // 2. 获取或创建今天的用量记录
  const userLimit = await prisma.userLimit.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (userLimit && userLimit.count >= limitAmount) {
    return false; // 已超出限制
  }

  // 3. 更新用量
  await prisma.userLimit.upsert({
    where: { userId_date: { userId, date: today } },
    update: { count: { increment: 1 } },
    create: {
      userId,
      date: today,
      count: 1,
    },
  });

  return true;
}