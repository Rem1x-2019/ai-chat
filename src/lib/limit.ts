import { prisma } from "./db";

export async function checkLimit(userId: string): Promise<boolean> {
  // 获取今天的日期（UTC 时间），并将时间设置为午夜，以确保日期比较的准确性
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // 从环境变量读取每日限制数量，如果没有设置则默认为 20
  const limitAmount = parseInt(process.env.DEFAULT_DAILY_LIMIT || '20');

  // 尝试查找今天的用户限制记录
  const userLimit = await prisma.userLimit.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  // 如果找到了今天的记录，并且计数已达到或超过限制
  if (userLimit && userLimit.count >= userLimit.limit) {
    return false; // 已超出限制
  }

  // 如果记录不存在，或者存在但未超限，则使用 upsert 来创建或更新记录
  // upsert 是一个原子操作，能安全地处理并发请求
  await prisma.userLimit.upsert({
    where: { userId_date: { userId, date: today } },
    // 如果记录存在，则将 count 加 1
    update: { count: { increment: 1 } },
    // 如果记录不存在，则创建新记录
    create: {
      userId,
      date: today,
      count: 1, // 这是今天的第一条消息，所以计数从 1 开始
      limit: limitAmount,
    },
  });

  return true; // 未超出限制
}