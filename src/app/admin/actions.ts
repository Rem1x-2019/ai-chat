// 文件路径: src/app/admin/actions.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- System Config ---
// 这部分代码是正确的，保持不变
export async function getSystemConfig(key: string) {
  const config = await prisma.systemConfig.findUnique({
    where: { key },
  });
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
// 这部分代码是正确的，保持不变
export async function getApiServices() {
  return await prisma.apiService.findMany({
    orderBy: { name: 'asc' },
  });
}

// 【核心修复】修改此函数以正确处理更新操作
export async function upsertApiService(formData: FormData) {
  const id = formData.get('id') as string;
  
  if (id) {
    // --- 这是更新现有服务的逻辑 ---
    // 1. 我们只从表单中获取那些允许被修改的字段。
    const dataToUpdate = {
      apiKey: formData.get('apiKey') as string,
      baseUrl: formData.get('baseUrl') as string,
      model: formData.get('model') as string,
    };

    // 2. 添加一个简单的校验
    if (!dataToUpdate.apiKey) {
      throw new Error("API Key cannot be empty when updating.");
    }

    // 3. 执行更新操作，但 data 对象中不包含 'name' 字段。
    await prisma.apiService.update({ 
      where: { id }, 
      data: dataToUpdate 
    });

  } else {
    // --- 这是创建新服务的逻辑 (目前 UI 没有入口，但保持逻辑完整) ---
    const dataToCreate = {
      name: (formData.get('name') as string || '').trim(),
      apiKey: formData.get('apiKey') as string,
      baseUrl: formData.get('baseUrl') as string,
      model: formData.get('model') as string,
    };

    if (!dataToCreate.name || !dataToCreate.apiKey) {
      throw new Error("Service name and API Key are required for new services.");
    }
    
    await prisma.apiService.create({ data: dataToCreate });
  }

  // 无论更新还是创建，都重新验证路径以刷新缓存
  revalidatePath('/admin');
}


// --- User Management ---
// 这部分代码是正确的，保持不变
export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateUserLimit(userId: string, newLimit: number) {
  const limit = Math.max(0, Math.floor(newLimit));
  
  await prisma.user.update({
    where: { id: userId },
    data: { messageLimit: limit },
  });
  revalidatePath('/admin');
}