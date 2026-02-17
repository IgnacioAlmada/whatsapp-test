import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

export function verifyMetaSignature(req: Request, res: Response, next: NextFunction): Response | void {
  const signatureHeader = req.get("X-Hub-Signature-256");
  const rawBody = req.rawBody;

  if (!signatureHeader || !rawBody) {
    req.log?.warn({ hasSignature: Boolean(signatureHeader), hasRawBody: Boolean(rawBody) }, "Missing signature header or raw body");
    return res.sendStatus(401);
  }

  const [prefix, providedSignature] = signatureHeader.split("=");
  if (prefix !== "sha256" || !providedSignature) {
    req.log?.warn("Invalid signature header format");
    return res.sendStatus(401);
  }

  const expectedSignature = crypto.createHmac("sha256", env.metaAppSecret).update(rawBody).digest("hex");

  const provided = Buffer.from(providedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    req.log?.warn("Meta webhook signature verification failed");
    return res.sendStatus(403);
  }

  return next();
}
