import type { Logger } from "pino";

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
      id?: string;
      log: Logger;
    }
  }
}

export {};
