import dotenv from "dotenv";

dotenv.config();

function toNumber(value, fallback) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const requiredVars = [
  "PORT",
  "WHATSAPP_TOKEN",
  "PHONE_NUMBER_ID",
  "VERIFY_TOKEN",
  "META_APP_SECRET",
  "OPENAI_API_KEY",
  "OPENAI_MODEL"
];

for (const envVar of requiredVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 3000),
  verifyToken: process.env.VERIFY_TOKEN,
  metaAppSecret: process.env.META_APP_SECRET,
  whatsappToken: process.env.WHATSAPP_TOKEN,
  phoneNumberId: process.env.PHONE_NUMBER_ID,
  metaApiVersion: process.env.META_API_VERSION ?? "v21.0",
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL,
  openaiTemperature: toNumber(process.env.OPENAI_TEMPERATURE, 0.2),
  openaiMaxOutputTokens: toNumber(process.env.OPENAI_MAX_OUTPUT_TOKENS, 350),
  openaiTimeoutMs: toNumber(process.env.OPENAI_TIMEOUT_MS, 30000),
  metaTimeoutMs: toNumber(process.env.META_TIMEOUT_MS, 10000),
  redisUrl: process.env.REDIS_URL,
  dedupeTtlSeconds: toNumber(process.env.DEDUPE_TTL_SECONDS, 86400),
  sessionTtlSeconds: toNumber(process.env.SESSION_TTL_SECONDS, 604800),
  sessionMaxMessages: toNumber(process.env.SESSION_MAX_MESSAGES, 20),
  sessionMaxChars: toNumber(process.env.SESSION_MAX_CHARS, 8000),
  globalRateLimitPerMinute: toNumber(process.env.GLOBAL_RATE_LIMIT_PER_MINUTE, 300),
  userRateLimitPerMinute: toNumber(process.env.USER_RATE_LIMIT_PER_MINUTE, 30),
  retryMaxAttempts: toNumber(process.env.RETRY_MAX_ATTEMPTS, 3),
  typingIndicatorEnabled: process.env.ENABLE_TYPING_INDICATOR === "true"
};
