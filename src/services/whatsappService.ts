import axios from "axios";
import { env } from "../config/env.js";
import { retryWithBackoff } from "../utils/retry.js";

type MessagePayload = {
  messaging_product: "whatsapp";
  to: string;
  text?: { body: string };
  type?: "typing";
};

const metaClient = axios.create({
  baseURL: `https://graph.facebook.com/${env.metaApiVersion}`,
  timeout: env.metaTimeoutMs,
  headers: {
    Authorization: `Bearer ${env.whatsappToken}`,
    "Content-Type": "application/json"
  }
});

async function postMessage(payload: MessagePayload): Promise<void> {
  await retryWithBackoff(() => metaClient.post(`/${env.phoneNumberId}/messages`, payload), {
    attempts: env.retryMaxAttempts,
    initialDelayMs: 500
  });
}

export async function sendTypingIndicator(to: string): Promise<void> {
  if (!env.typingIndicatorEnabled) {
    return;
  }

  await postMessage({
    messaging_product: "whatsapp",
    to,
    type: "typing"
  });
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  await postMessage({
    messaging_product: "whatsapp",
    to,
    text: { body: message }
  });
}

export async function sendRateLimitMessage(to: string): Promise<void> {
  await postMessage({
    messaging_product: "whatsapp",
    to,
    text: { body: "Estamos recibiendo muchas solicitudes tuyas en este momento. Probá de nuevo en 1 minuto 🙏" }
  });
}
