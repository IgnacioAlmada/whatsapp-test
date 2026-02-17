export type IncomingMessage = {
  id: string;
  from: string;
  text: string;
  timestamp?: string;
  type?: string;
};

type WhatsAppMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  interactive?: {
    type?: "button_reply" | "list_reply";
    button_reply?: { id?: string; title?: string };
    list_reply?: { id?: string; title?: string };
  };
};

function extractTextFromMessage(message: WhatsAppMessage): string | null {
  if (message.type === "text") {
    return message.text?.body?.trim() ?? null;
  }

  if (message.type === "interactive") {
    const interactive = message.interactive;
    if (interactive?.type === "button_reply") {
      return interactive.button_reply?.title?.trim() || interactive.button_reply?.id || null;
    }

    if (interactive?.type === "list_reply") {
      return interactive.list_reply?.title?.trim() || interactive.list_reply?.id || null;
    }
  }

  return null;
}

export function extractIncomingMessages(payload: unknown): IncomingMessage[] {
  const root = payload as {
    entry?: Array<{ changes?: Array<{ value?: { messages?: WhatsAppMessage[] } }> }>;
  };

  const results: IncomingMessage[] = [];

  for (const entry of root?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const messages = change?.value?.messages;

      if (!Array.isArray(messages) || messages.length === 0) {
        continue;
      }

      for (const message of messages) {
        const text = extractTextFromMessage(message);
        if (!text || !message.from || !message.id) {
          continue;
        }

        results.push({
          id: message.id,
          from: message.from,
          text,
          timestamp: message.timestamp,
          type: message.type
        });
      }
    }
  }

  return results;
}
