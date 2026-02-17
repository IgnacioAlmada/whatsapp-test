import crypto from "node:crypto";
import pinoHttp from "pino-http";
import { logger } from "../lib/logger.js";

export const requestContextMiddleware = pinoHttp({
  logger,
  genReqId(req, res) {
    const requestId = (req.headers["x-request-id"] as string | undefined) || crypto.randomUUID();
    res.setHeader("x-request-id", requestId);
    return requestId;
  }
});
