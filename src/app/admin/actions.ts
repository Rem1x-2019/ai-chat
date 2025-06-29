// 文件路径: src/app/admin/actions.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- System Config ---
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


// --- API Service Management ---
/**
 * 获取所有 API 服务配置
 */
export async function getApiServices() {
  return await prisma.apiService.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * 更新或创建 API 服务配置
 * @param formData 表单数据
 */
export async function upsertApiService(formData: FormData) {
  const id = formData.get('id') as string;
  const data = {
    name: (formData.get('name') as string).trim(),
    apiKey: formData.get('apiKey') as string,
    baseUrl: formData.get('baseUrl') as string,
    model: formData.get('model') as string,
  };

  if (!data.name || !data.apiKey) {
    throw new Error("Service name and API Key are required.");
  }
  
  if (id) {
    // 更新现有服务
    await prisma.apiService.update({ where: { id }, data });
  } else {
    // 创建新服务
    await prisma.apiService.create({ data });
  }
  revalidatePath('/admin');
}


// --- User Management ---
/**
 * 获取所有用户列表
 */
export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * 更新指定用户的消息额度
 * @param userId 用户 ID
 * @param newLimit 新的额度
 */
export async function updateUserLimit(userId: string, newLimit: number) {
  // 确保额度是有效的非负整数
  const limit = Math.max(0, Math.floor(newLimit));
  
  await prisma.user.update({
    where: { id: userId },
    data: { messageLimit: limit },
  });
  revalidatePath('/admin');
}