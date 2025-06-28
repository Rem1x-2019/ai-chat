import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function chatWithOpenAI(messages: Message[]): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
  });

  return completion.choices[0].message?.content ?? "AI 无响应";
}
