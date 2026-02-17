# WhatsApp Bot + GPT-5 (Meta Cloud API)

Implementación base en Node.js + Express con una estructura modular (routes/controllers/services) para conectar:

- WhatsApp Business Cloud API (Meta)
- OpenAI API (GPT-5 o GPT-5-mini)

## Requisitos

- Node.js 18+
- Cuenta Meta Developer con WhatsApp Cloud API
- API key de OpenAI

## Instalación

```bash
npm install
cp .env.example .env
```

Completa los valores en `.env`.

## Ejecución

```bash
npm run start
```

Para desarrollo:

```bash
npm run dev
```

## Endpoints

- `GET /webhook` → verificación de webhook de Meta
- `POST /webhook` → recepción de mensajes entrantes y respuesta automática
- `GET /health` → health check simple

## Contexto conversacional

El proyecto guarda contexto en memoria por número telefónico (máximo 20 mensajes entre usuario y asistente).

> Para producción se recomienda reemplazar esto por Redis, Firestore o MongoDB.

## Seguridad recomendada

- Nunca subir `.env` al repositorio
- Usar HTTPS en deployment
- Implementar validación de firma de webhook de Meta
- Agregar rate limiting y observabilidad
