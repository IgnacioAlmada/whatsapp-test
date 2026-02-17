export interface DedupeStore {
  has(messageId: string): Promise<boolean>;
  set(messageId: string): Promise<void>;
  ping(): Promise<boolean>;
}
