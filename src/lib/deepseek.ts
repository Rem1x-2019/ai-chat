// 文件路径: aichat/src/lib/deepseek.ts
import { prisma } from "./db";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * 通用的、兼容 OpenAI 接口的流式聊天函数
 * @param providerName "deepseek" 或 "openai"
 * @param messages 聊天消息数组
 * @returns 一个 ReadableStream 流
 */
export async function streamChatWithProvider(providerName: string, messages: Message[]): Promise<ReadableStream> {
  const service = await prisma.apiService.findUnique({ where: { name: providerName } });
  if (!service || !service.apiKey) {
    throw new Error(`API service "${providerName}" is not configured in the database.`);
  }

  await prisma.apiService.update({
    where: { name: providerName },
    data: { usageCount: { increment: 1 } },
  });

  const apiUrl = service.baseUrl;
  if (!apiUrl) {
    throw new Error(`Base URL for "${providerName}" is not configured.`);
  }

  const model = service.model || (providerName === 'openai' ? 'gpt-4' : undefined);
  if (!model) {
    throw new Error(`Model name for "${providerName}" is not configured.`);
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${service.apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: true // 关键：开启流式输出
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`${providerName} API Error:`, errorBody);
    throw new Error(`${providerName} API request failed with status ${res.status}`);
  }
  
  if (!res.body) {
    throw new Error("The response body is empty.");
  }
  
  return res.body;
}