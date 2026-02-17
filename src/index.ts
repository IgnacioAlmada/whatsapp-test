import compression from "compression";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { closeRedisClient } from "./lib/redisClient.js";
import { logger } from "./lib/logger.js";
import { requestContextMiddleware } from "./middleware/requestContext.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import { redis } from "./store/index.js";

const app = express();

app.use(requestContextMiddleware);
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(compression());
app.use(
  express.json({
    verify: (req: Request, _res: Response, buffer: Buffer) => {
      req.rawBody = buffer;
    }
  })
);

app.use(webhookRoutes);

app.get("/health", async (_req: Request, res: Response) => {
  const criticalEnvOk = Boolean(env.whatsappToken && env.phoneNumberId && env.openaiApiKey && env.metaAppSecret);

  let redisOk = true;
  if (redis) {
    try {
      await redis.ping();
      redisOk = true;
    } catch {
      redisOk = false;
    }
  }

  const ok = criticalEnvOk && redisOk;
  return res.status(ok ? 200 : 503).json({
    ok,
    checks: {
      env: criticalEnvOk,
      redis: redis ? redisOk : "not_configured"
    }
  });
});

const server = app.listen(env.port, () => {
  logger.info({ port: env.port }, "Server started");
});

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info({ signal }, "Graceful shutdown started");

  server.close(async () => {
    try {
      await closeRedisClient();
      logger.info("Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, "Graceful shutdown failed");
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});
