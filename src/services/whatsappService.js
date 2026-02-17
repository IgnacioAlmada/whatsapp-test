import axios from "axios";
import { env } from "../config/env.js";

export async function sendWhatsAppMessage(to, message) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${env.phoneNumberId}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: message }
    },
    {
      headers: {
        Authorization: `Bearer ${env.whatsappToken}`,
        "Content-Type": "application/json"
      }
    }
  );
}
