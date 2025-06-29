// 文件路径: src/app/admin/actions.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * 获取系统配置项
 * @param key 配置键
 * @returns 配置值，如果不存在则返回 null
 */
export async function getSystemConfig(key: string) {
  const config = await prisma.systemConfig.findUnique({
    where: { key },
  });
  return config?.value || null;
}

/**
 * 更新或创建系统配置项
 * @param key 配置键
 * @param value 配置值
 */
export async function setSystemConfig(key: string, value: string) {
  await prisma.systemConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  // 清除 admin 页面的缓存，以便下次访问时能看到最新设置
  revalidatePath('/admin');
}