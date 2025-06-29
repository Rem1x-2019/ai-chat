// 文件路径: src/app/admin/actions.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// 定义一个统一的表单状态类型
export type FormState = {
  message: string;
  error: boolean;
};

// --- System Config ---
// ... getSystemConfig, setSystemConfig 保持不变 ...
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

// 修改函数签名以匹配 useFormState 的要求
export async function upsertApiService(prevState: FormState, formData: FormData): Promise<FormState> {
  const id = formData.get('id') as string;
  const dataToUpdate = {
    apiKey: formData.get('apiKey') as string,
    baseUrl: formData.get('baseUrl') as string,
    model: formData.get('model') as string,
  };

  if (!dataToUpdate.apiKey) {
    return { message: "API Key 不能为空。", error: true };
  }
  
  try {
    if (id) {
      await prisma.apiService.update({ where: { id }, data: dataToUpdate });
      revalidatePath('/admin');
      return { message: '更新成功！', error: false };
    }
    // 创建逻辑可以后续添加
    return { message: "不支持创建新服务。", error: true };
  } catch (error) {
    return { message: '更新失败，请查看服务器日志。', error: true };
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

// 修改函数签名以匹配 useFormState 的要求
export async function deleteUser(prevState: FormState, formData: FormData): Promise<FormState> {
  const userId = formData.get('userId') as string;
  try {
    if (!userId) {
      return { message: '缺少用户 ID。', error: true };
    }
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/admin');
    return { message: `用户 ${userId} 已删除。`, error: false };
  } catch (error) {
    return { message: '删除用户失败。', error: true };
  }
}