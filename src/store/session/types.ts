export type ChatMessage = { role: "user" | "assistant"; content: string };

export interface SessionStore {
  append(userPhone: string, message: ChatMessage): Promise<void>;
  getHistory(userPhone: string): Promise<ChatMessage[]>;
  ping(): Promise<boolean>;
}
