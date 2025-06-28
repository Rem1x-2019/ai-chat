// 定义消息对象的接口
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * 使用指定的托管服务（如华为云ModelArts）与DeepSeek模型进行聊天。
 * @param messages 聊天消息数组
 * @returns AI模型的回复文本
 */
export async function chatWithDeepSeek(messages: Message[]): Promise<string> {
  // 从环境变量中获取您的特定API URL和模型名称
  const apiUrl = process.env.DEEPSEEK_API_URL;
  const modelName = process.env.DEEPSEEK_MODEL_NAME;

  // 校验必要的环境变量是否已配置
  if (!apiUrl || !modelName) {
    throw new Error("请在 .env 文件中配置 DEEPSEEK_API_URL 和 DEEPSEEK_MODEL_NAME");
  }

  // 发送 POST 请求到您的 API 地址
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 使用环境变量中的 API Key 进行认证
      "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      // 指定您要使用的模型名称
      "model": modelName,
      // 传入完整的消息历史
      "messages": messages,
      // 设置温度参数以控制随机性
      "temperature": 0.6,
      // 明确设置 stream 为 false，因为我们的应用后端目前处理的是一次性响应
      "stream": false
    }),
  });

  // 检查响应状态码
  if (!res.ok) {
    const errorBody = await res.text();
    console.error("DeepSeek (ModelArts) API Error:", errorBody);
    throw new Error(`DeepSeek (ModelArts) API 请求失败，状态码: ${res.status}`);
  }

  // 解析返回的 JSON 数据
  const data = await res.json();

  // 从标准 OpenAI 兼容的响应结构中提取回复内容
  // 假设 ModelArts 的返回格式与 OpenAI 一致
  return data.choices[0]?.message?.content ?? "AI 未提供有效回复。";
}