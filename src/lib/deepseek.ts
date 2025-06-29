// 文件路径: aichat/src/lib/deepseek.ts (现在变成通用的了)
import { prisma } from "./db";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * 通用的、兼容 OpenAI 接口的聊天函数
 * @param providerName "deepseek" 或 "openai"
 * @param messages 聊天消息数组
 * @returns AI 模型的回复文本
 */
export async function chatWithProvider(providerName: string, messages: Message[]): Promise<string> {
  // 1. 从数据库获取 API 服务配置
  const service = await prisma.apiService.findUnique({
    where: { name: providerName },
  });

  if (!service || !service.apiKey) {
    throw new Error(`API service "${providerName}" is not configured in the database.`);
  }

  // 2. 更新使用次数统计 (原子操作)
  await prisma.apiService.update({
    where: { name: providerName },
    data: { usageCount: { increment: 1 } },
  });

  // 3. 构造请求
  const apiUrl = service.baseUrl || (providerName === 'openai' ? 'https://api.openai.com/v1/chat/completions' : '');
  if (!apiUrl) {
    throw new Error(`Base URL for "${providerName}" is not configured.`);
  }

  const model = service.model || (providerName === 'openai' ? 'gpt-4' : 'deepseek-chat');

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${service.apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.6,
      stream: false
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`${providerName} API Error:`, errorBody);
    throw new Error(`${providerName} API request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? "AI did not provide a valid response.";
}