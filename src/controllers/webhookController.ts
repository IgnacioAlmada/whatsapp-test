import axios from "axios";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { enqueueTask } from "../queue/backgroundQueue.js";
import { generateGPTResponse } from "../services/openaiService.js";
import { sendRateLimitMessage, sendTypingIndicator, sendWhatsAppMessage } from "../services/whatsappService.js";
import { dedupeStore, sessionStore } from "../store/index.js";
import { FixedWindowRateLimiter } from "../utils/rateLimiter.js";
import { extractIncomingMessages, type IncomingMessage } from "../utils/whatsappPayload.js";

const globalLimiter = new FixedWindowRateLimiter(env.globalRateLimitPerMinute, 60_000);
const userLimiter = new FixedWindowRateLimiter(env.userRateLimitPerMinute, 60_000);

export function verifyWebhook(req: Request, res: Response): Response {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.verifyToken) {
    req.log.info("Meta webhook verified");
    return res.status(200).send(challenge);
  }

  req.log.warn("Meta webhook verify rejected");
  return res.sendStatus(403);
}

async function processMessage(message: IncomingMessage, requestId: string): Promise<void> {
  const { id, from, text } = message;

  if (await dedupeStore.has(id)) {
    return;
  }
  await dedupeStore.set(id);

  const globalResult = globalLimiter.consume("global");
  const userResult = userLimiter.consume(from);

  if (!globalResult.allowed || !userResult.allowed) {
    try {
      await sendRateLimitMessage(from);
    } catch (error) {
      logger.error({ requestId, err: error, meta: axios.isAxiosError(error) ? error.response?.data : undefined }, "Failed to send rate limit message");
    }
    return;
  }

  try {
    await sessionStore.append(from, { role: "user", content: text });
    const history = await sessionStore.getHistory(from);

    await sendTypingIndicator(from);
    const aiResponse = await generateGPTResponse(history);

    await sessionStore.append(from, { role: "assistant", content: aiResponse });
    await sendWhatsAppMessage(from, aiResponse);
  } catch (error) {
    logger.error({ requestId, messageId: id, err: error, meta: axios.isAxiosError(error) ? error.response?.data : undefined }, "Webhook task failed");

    try {
      await sendWhatsAppMessage(from, "Tuvimos un problema temporal procesando tu mensaje. Intentá nuevamente en unos segundos.");
    } catch (sendError) {
      logger.error({ requestId, messageId: id, err: sendError, meta: axios.isAxiosError(sendError) ? sendError.response?.data : undefined }, "Fallback message failed");
    }
  }
}

export function receiveWebhook(req: Request, res: Response): Response {
  const incomingMessages = extractIncomingMessages(req.body);

  if (incomingMessages.length === 0) {
    return res.sendStatus(200);
  }

  const requestId = req.id ?? "unknown";
  for (const message of incomingMessages) {
    enqueueTask(async () => {
      await processMessage(message, requestId);
    });
  }

  return res.sendStatus(200);
}
