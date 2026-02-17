import axios from "axios";
import { env } from "../config/env.js";

const SYSTEM_PROMPT = "Eres un asistente profesional, claro y útil para atención por WhatsApp.";

export async function generateGPTResponse(history) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: env.openaiModel,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      temperature: 0.7,
      max_tokens: 350
    },
    {
      headers: {
        Authorization: `Bearer ${env.openaiApiKey}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices?.[0]?.message?.content?.trim() || "No pude generar una respuesta en este momento.";
}
