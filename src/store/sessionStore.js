import { sessionStore } from "./index.js";

export async function appendUserMessage(userPhone, content) {
  await sessionStore.append(userPhone, { role: "user", content });
}

export async function appendAssistantMessage(userPhone, content) {
  await sessionStore.append(userPhone, { role: "assistant", content });
}

export async function getSessionHistory(userPhone) {
  return sessionStore.getHistory(userPhone);
}
