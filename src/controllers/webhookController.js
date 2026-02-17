import { env } from "../config/env.js";
import { generateGPTResponse } from "../services/openaiService.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";
import {
  appendAssistantMessage,
  appendUserMessage,
  getSessionHistory
} from "../store/sessionStore.js";

export function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.verifyToken) {
    console.log("Webhook verificado");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
}

export async function receiveWebhook(req, res) {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const from = message?.from;
    const text = message?.text?.body;

    if (!from || !text) {
      return res.sendStatus(200);
    }

    appendUserMessage(from, text);
    const history = getSessionHistory(from);
    const aiResponse = await generateGPTResponse(history);

    appendAssistantMessage(from, aiResponse);
    await sendWhatsAppMessage(from, aiResponse);

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook processing failed:", error.response?.data || error.message);
    return res.sendStatus(500);
  }
}
