import express from "express";
import bodyParser from "body-parser";
import { env } from "./config/env.js";
import webhookRoutes from "./routes/webhookRoutes.js";

const app = express();
app.use(bodyParser.json());
app.use(webhookRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(env.port, () => {
  console.log(`Servidor corriendo en puerto ${env.port}`);
});
