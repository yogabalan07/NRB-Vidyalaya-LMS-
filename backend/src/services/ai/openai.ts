import { config } from "../../config/environment.js";

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIChoice {
  message: { content: string };
  finish_reason: string;
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
}

export function isOpenAIConfigured(): boolean {
  return Boolean(config.openaiApiKey);
}

export async function generateChatCompletion(
  messages: OpenAIMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  if (!config.openaiApiKey) {
    throw new Error(
      "AI service not configured. Set OPENAI_API_KEY environment variable."
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("OpenAI API error:", response.status, errorBody);
    throw new Error(`AI provider error: ${response.status}`);
  }

  const data = (await response.json()) as OpenAIResponse;
  return data.choices[0]?.message?.content ?? "";
}

export async function generateJSON<T>(
  messages: OpenAIMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<T> {
  const content = await generateChatCompletion(messages, options);

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON");
  }

  return JSON.parse(jsonMatch[0]) as T;
}
