const MAX_MESSAGES = 20;
const sessions = new Map();

export function appendUserMessage(userPhone, content) {
  const history = sessions.get(userPhone) ?? [];
  history.push({ role: "user", content });
  sessions.set(userPhone, history.slice(-MAX_MESSAGES));
}

export function appendAssistantMessage(userPhone, content) {
  const history = sessions.get(userPhone) ?? [];
  history.push({ role: "assistant", content });
  sessions.set(userPhone, history.slice(-MAX_MESSAGES));
}

export function getSessionHistory(userPhone) {
  return sessions.get(userPhone) ?? [];
}
