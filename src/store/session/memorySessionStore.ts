import type { ChatMessage, SessionStore } from "./types.js";

function truncateHistory(history: ChatMessage[], maxMessages: number, maxChars: number): ChatMessage[] {
  const trimmedByCount = history.slice(-maxMessages);
  const output: ChatMessage[] = [];
  let totalChars = 0;

  for (let index = trimmedByCount.length - 1; index >= 0; index -= 1) {
    const item = trimmedByCount[index];
    const size = item.content.length;
    if (totalChars + size > maxChars) {
      break;
    }

    output.unshift(item);
    totalChars += size;
  }

  return output;
}

export class MemorySessionStore implements SessionStore {
  private readonly maxMessages: number;
  private readonly maxChars: number;
  private readonly sessions = new Map<string, ChatMessage[]>();

  constructor({ maxMessages, maxChars }: { maxMessages: number; maxChars: number }) {
    this.maxMessages = maxMessages;
    this.maxChars = maxChars;
  }

  async append(userPhone: string, message: ChatMessage): Promise<void> {
    const history = this.sessions.get(userPhone) ?? [];
    history.push(message);
    this.sessions.set(userPhone, truncateHistory(history, this.maxMessages, this.maxChars));
  }

  async getHistory(userPhone: string): Promise<ChatMessage[]> {
    return this.sessions.get(userPhone) ?? [];
  }

  async ping(): Promise<boolean> {
    return true;
  }
}
