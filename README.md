# WhatsApp Bot + GPT-5 (Meta Cloud API)

Backend **TypeScript** + Express para integrar WhatsApp Cloud API (Meta) con OpenAI Responses API (GPT-5 / GPT-5-mini), listo para producción liviana.

## Qué incluye

- Verificación de webhook Meta (`GET /webhook` + `POST /webhook` firmado con HMAC SHA-256).
- Parsing robusto de payloads WhatsApp (texto, interactivos button/list, múltiples mensajes por webhook).
- ACK inmediato del webhook + procesamiento en segundo plano.
- Idempotencia por `message.id` con TTL (memoria o Redis opcional).
- Contexto conversacional persistible (memoria o Redis), con truncado por cantidad y tamaño.
- OpenAI Responses API con timeout y fallback.
- Reintentos con backoff para Meta (5xx/429/transitorios).
- Rate limiting global y por usuario (`from`).
- Logging estructurado (pino + request-id), helmet, compression, healthcheck extendido y graceful shutdown.

## Requisitos

- Node.js 18+
- Cuenta Meta Developer con WhatsApp Cloud API configurada
- API key de OpenAI con acceso al modelo elegido
- (Opcional) Redis

## Setup local

```bash
npm install
cp .env.example .env
npm run build
npm run start
```

Para desarrollo:

```bash
npm run dev
```

## Variables de entorno

Ver `.env.example`. Variables críticas:

- `WHATSAPP_TOKEN`
- `PHONE_NUMBER_ID`
- `VERIFY_TOKEN`
- `META_APP_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Endpoints

- `GET /webhook`: verificación de suscripción Meta.
- `POST /webhook`: recepción de eventos Meta (requiere firma válida).
- `GET /health`: estado de app + chequeo Redis (si configurado).

## Nota de firma de webhook

`POST /webhook` valida `X-Hub-Signature-256` con `META_APP_SECRET` sobre el raw body. Firma inválida => `401/403`.

## Deploy checklist

- [ ] HTTPS público habilitado.
- [ ] Webhook URL pública configurada en Meta.
- [ ] `META_APP_SECRET` correcto.
- [ ] Token de WhatsApp permanente/rotación controlada.
- [ ] `REDIS_URL` para multi-instancia.
- [ ] Timeouts y rate limits ajustados por tráfico.

## Scripts

- `npm run dev` (tsx watch)
- `npm run check` (tsc --noEmit)
- `npm run build` (tsc)
- `npm run start` (node dist/index.js)
