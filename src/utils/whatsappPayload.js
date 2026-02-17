function extractTextFromMessage(message) {
  if (message.type === "text") {
    return message.text?.body?.trim();
  }

  if (message.type === "interactive") {
    const interactive = message.interactive;
    if (interactive?.type === "button_reply") {
      return interactive.button_reply?.title?.trim() || interactive.button_reply?.id;
    }

    if (interactive?.type === "list_reply") {
      return interactive.list_reply?.title?.trim() || interactive.list_reply?.id;
    }
  }

  return null;
}

export function extractIncomingMessages(payload) {
  const results = [];

  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const value = change?.value;
      const messages = value?.messages;

      if (!Array.isArray(messages) || messages.length === 0) {
        continue;
      }

      for (const message of messages) {
        const text = extractTextFromMessage(message);
        if (!text || !message?.from || !message?.id) {
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
