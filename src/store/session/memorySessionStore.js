function truncateHistory(history, maxMessages, maxChars) {
  const trimmedByCount = history.slice(-maxMessages);
  const output = [];
  let totalChars = 0;

  for (let index = trimmedByCount.length - 1; index >= 0; index -= 1) {
    const item = trimmedByCount[index];
    const size = (item.content ?? "").length;
    if (totalChars + size > maxChars) {
      break;
    }

    output.unshift(item);
    totalChars += size;
  }

  return output;
}

export class MemorySessionStore {
  constructor({ maxMessages, maxChars }) {
    this.maxMessages = maxMessages;
    this.maxChars = maxChars;
    this.sessions = new Map();
  }

  async append(userPhone, message) {
    const history = this.sessions.get(userPhone) ?? [];
    history.push(message);
    this.sessions.set(userPhone, truncateHistory(history, this.maxMessages, this.maxChars));
  }

  async getHistory(userPhone) {
    return this.sessions.get(userPhone) ?? [];
  }

  async ping() {
    return true;
  }
}
