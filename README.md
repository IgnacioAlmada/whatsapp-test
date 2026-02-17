# WhatsApp Bot + GPT-5 (Meta Cloud API)

Backend Node.js + Express para integrar WhatsApp Cloud API (Meta) con OpenAI Responses API (GPT-5 / GPT-5-mini), listo para escenarios de producción livianos.

## Qué incluye

- Verificación de webhook de Meta (`GET /webhook` + `POST /webhook` con firma HMAC SHA-256).
- Parsing robusto de payloads WhatsApp (texto, interactivos button/list, múltiples mensajes por webhook).
- Acknowledge rápido (200 inmediato) + procesamiento en cola en segundo plano.
- Idempotencia por `message.id` con TTL (memoria o Redis opcional).
- Contexto conversacional persistible (memoria o Redis opcional, con truncado por cantidad y tamaño).
- OpenAI Responses API con timeout y fallback.
- Reintentos con backoff para envíos a Meta (5xx/429 o errores transitorios).
- Rate limit global y por usuario (`from`).
- Logging estructurado (pino + request-id), healthcheck extendido, helmet, compression y graceful shutdown.

## Requisitos

- Node.js 18+
- Cuenta Meta Developer con WhatsApp Cloud API configurada
- API key de OpenAI con acceso al modelo elegido
- (Opcional) Redis para dedupe/contexto persistente

## Setup local

```bash
npm install
cp .env.example .env
npm run start
```

> Si no podés instalar dependencias en tu entorno CI por políticas de red, dejá el código y corré estos pasos en tu entorno de deploy/local con acceso al registro npm.

## Variables de entorno

Tomá `.env.example` como referencia.

### Críticas

- `WHATSAPP_TOKEN`
- `PHONE_NUMBER_ID`
- `VERIFY_TOKEN`
- `META_APP_SECRET` (usado para verificar `X-Hub-Signature-256`)
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

### Opcionales recomendadas

- `REDIS_URL`
- `OPENAI_TEMPERATURE`
- `OPENAI_MAX_OUTPUT_TOKENS`
- `OPENAI_TIMEOUT_MS`
- `META_TIMEOUT_MS`
- `GLOBAL_RATE_LIMIT_PER_MINUTE`
- `USER_RATE_LIMIT_PER_MINUTE`

## Endpoints

- `GET /webhook`: verificación de suscripción Meta.
- `POST /webhook`: recepción de eventos Meta (requiere firma válida).
- `GET /health`: estado de app + chequeo de Redis si está configurado.

## Nota sobre verificación de firma

Para `POST /webhook` se valida la firma `X-Hub-Signature-256` con `META_APP_SECRET` usando el **raw body** del request. Si la firma falla, se responde `401/403` sin procesar mensajes.

## Deploy checklist (producción)

- [ ] HTTPS público habilitado.
- [ ] Webhook URL pública correcta configurada en Meta.
- [ ] `META_APP_SECRET` seteado y coincidente con la app de Meta.
- [ ] Token de WhatsApp permanente o con rotación controlada.
- [ ] `REDIS_URL` configurado para dedupe/contexto compartido entre instancias.
- [ ] Variables de timeout/rate limit ajustadas por carga real.
- [ ] Logs centralizados y alertas sobre `/health`.

## Scripts

- `npm run start`
- `npm run dev`
- `npm run check`
- `npm run check:all`
