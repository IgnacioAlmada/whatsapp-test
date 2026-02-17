import axios from "axios";
import { env } from "../config/env.js";
import type { ChatMessage } from "../store/session/types.js";

const SYSTEM_PROMPT = "Eres un asistente profesional, claro y útil para atención por WhatsApp.";

const openAIClient = axios.create({
  baseURL: "https://api.openai.com/v1",
  timeout: env.openaiTimeoutMs,
  headers: {
    Authorization: `Bearer ${env.openaiApiKey}`,
    "Content-Type": "application/json"
  }
});

export async function generateGPTResponse(history: ChatMessage[]): Promise<string> {
  try {
    const input = [
      {
        role: "system",
        content: [{ type: "input_text", text: SYSTEM_PROMPT }]
      },
      ...history.map((item) => ({
        role: item.role,
        content: [{ type: "input_text", text: item.content }]
      }))
    ];

    const response = await openAIClient.post<{ output_text?: string }>("/responses", {
      model: env.openaiModel,
      input,
      temperature: env.openaiTemperature,
      max_output_tokens: env.openaiMaxOutputTokens
    });

    return response.data.output_text?.trim() || "Ahora mismo no pude generar respuesta. Intentá nuevamente en unos segundos.";
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    throw new Error(`OpenAI request failed: ${status || "no_status"}`);
  }
}
