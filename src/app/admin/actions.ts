// 文件路径: src/app/admin/actions.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- System Config ---
export async function getSystemConfig(key: string) {
  const config = await prisma.systemConfig.findUnique({ where: { key } });
  return config?.value || null;
}
export async function setSystemConfig(key: string, value: string) {
  await prisma.systemConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  revalidatePath('/admin');
}

// --- API Service Management ---
export async function getApiServices() {
  return await prisma.apiService.findMany({ orderBy: { name: 'asc' } });
}

export async function upsertApiService(prevState: { message: string | null }, formData: FormData) {
  const id = formData.get('id') as string;
  const dataToUpdate = {
    apiKey: formData.get('apiKey') as string,
    baseUrl: formData.get('baseUrl') as string,
    model: formData.get('model') as string,
  };

  if (!dataToUpdate.apiKey) {
    return { message: null, error: "API Key 不能为空。" };
  }
  
  try {
    if (id) {
      await prisma.apiService.update({ where: { id }, data: dataToUpdate });
      revalidatePath('/admin');
      return { message: '更新成功！', error: null };
    }
    // 创建逻辑可以后续添加
    return { message: null, error: "不支持创建新服务。" };
  } catch (error) {
    return { message: null, error: '更新失败，请查看服务器日志。' };
  }
}

// --- User Management ---
export async function getUsers() {
  return await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function updateUserLimit(userId: string, newLimit: number) {
  const limit = Math.max(0, Math.floor(newLimit));
  await prisma.user.update({ where: { id: userId }, data: { messageLimit: limit } });
  revalidatePath('/admin');
}

// 新增：删除用户的服务器操作
export async function deleteUser(userId: string) {
  try {
    // 可以在此添加逻辑，防止删除关键管理员
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/admin');
    return { message: `用户 ${userId} 已删除。` };
  } catch (error) {
    return { message: '删除用户失败，请查看服务器日志。' };
  }
}