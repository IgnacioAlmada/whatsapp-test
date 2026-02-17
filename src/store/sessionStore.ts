import { sessionStore } from "./index.js";
import type { ChatMessage } from "./session/types.js";

export async function appendUserMessage(userPhone: string, content: string): Promise<void> {
  await sessionStore.append(userPhone, { role: "user", content });
}

export async function appendAssistantMessage(userPhone: string, content: string): Promise<void> {
  await sessionStore.append(userPhone, { role: "assistant", content });
}

export async function getSessionHistory(userPhone: string): Promise<ChatMessage[]> {
  return sessionStore.getHistory(userPhone);
}
