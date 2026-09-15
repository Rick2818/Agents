# ⚡ Destraba AI / Unblock AI

> **"Destraba tu empresa en 60 segundos. Activa tu agente soberano hoy y pon tu negocio en piloto automático 24/7 en la nube."**  
> *"Unblock your business in 60 seconds. Deploy your autonomous agent today and put operations on 24/7 cloud autopilot."*

Plataforma fiduciaria B2B, simple, bilingüe (Español / English) y de máxima ciberseguridad, diseñada para transformar **dolores operativos no resueltos** en **Custom Agents autónomos** listos para producción en **Google Antigravity**, impulsados nativamente por **Google Gemini 3.6 Flash** y desplegados 24/7 en **Vercel Serverless** con cero dependencia de computadoras locales.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed%2024%2F7-black?logo=vercel)](https://destraba-ai.vercel.app)
[![Telegram Bot](https://img.shields.io/badge/Telegram-@ricardo__asistente__2026__bot-26A5E4?logo=telegram)](https://t.me/ricardo_asistente_2026_bot)
[![Supabase Database](https://img.shields.io/badge/Supabase-Hardened%20Postgres-3ECF8E?logo=supabase)](https://iocwkuvkjeyonqosetvj.supabase.co)
[![Bitcoin Lightning](https://img.shields.io/badge/Strike-Lightning%20USD-FFD700?logo=bitcoin)](https://strike.me)
[![Node Tests](https://img.shields.io/badge/Tests-Passing%20100%25-brightgreen)](https://github.com/Rick2818/Agents)

---

## 🏛️ Los 7 Pilares Inviolables de la Arquitectura Fiduciaria Enterprise

1. **Arquitectura Cloud-Native 24/7 (Cero Dependencia Local):**
   - El sistema corre 100% en la nube a través de Vercel Serverless. Tu computadora puede permanecer apagada durante semanas y el asistente de Telegram y los despachadores siguen respondiendo de inmediato.
2. **Retención Cero en Disco (100% Memoria Volátil RAM):**
   - Ninguna nota de voz (`.oga` / `.ogg` / `.wav`), archivo adjunto o mensaje sensible toca el disco del servidor. Todo se procesa en `Buffer` volátil y se destruye en bloques `finally { purgeMemoryBuffer(buf); }`.
3. **Secretos Fail-Closed e Inviolabilidad de Credenciales:**
   - La falta de variables críticas (`GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `PLATFORM_MASTER_KEY`) aborta el inicio con HTTP 503. Cero fallbacks a credenciales por defecto.
4. **Mitigación Criptográfica de Timing Attacks:**
   - Comparaciones de tokens (`X-Telegram-Bot-Api-Secret-Token`, `Authorization: Bearer <CRON_SECRET>`) ejecutadas en tiempo constante vía `crypto.timingSafeEqual`.
5. **Anti-DoS, ReDoS y Rate Limiting en Memoria:**
   - Ventanas deslizantes de rate limiting por IP, cuotas de payload (máximo 10 MB) y sanitización universal anti-XSS.
6. **Cabeceras de Ciberseguridad Bancaria y CORS Restringido:**
   - HSTS 2 años preload, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` y orígenes estrictamente controlados (prohibido comodín `*`).
7. **Liquidación Fiduciaria Directa (Strike Lightning & Wompi):**
   - Recaudación sin intermediarios hacia `rick2818@strike.me` y pasarela Wompi con verificación HMAC SHA-256.

---

## 🚀 Despliegue en la Nube & Endpoints Serverless (Vercel)

- **URL Oficial de Producción:** [`https://destraba-ai.vercel.app`](https://destraba-ai.vercel.app)
- **Dashboard Ejecutivo:** [`https://destraba-ai.vercel.app/dashboard`](https://destraba-ai.vercel.app/dashboard)
- **Telegram Webhook Serverless:** [`https://destraba-ai.vercel.app/api/telegram`](https://destraba-ai.vercel.app/api/telegram)
- **Master Cloud Dispatcher (Cron):** [`https://destraba-ai.vercel.app/api/cron/master-dispatcher`](https://destraba-ai.vercel.app/api/cron/master-dispatcher)
- **Catálogo Fiduciario:** [`https://destraba-ai.vercel.app/api/catalog`](https://destraba-ai.vercel.app/api/catalog)

---

## 👥 Equipo Multi-Agente Fiduciario Activo

| Agente | Rol Operativo | Modelo | Misión Principal |
| :--- | :--- | :--- | :--- |
| **`marketing-director`** | Directora de Mercadeo | `gemini-2.5-flash` | Posicionamiento fiduciario, distribución en Buffer/LinkedIn y siembra de autoridad. |
| **`sales-closer-specialist`** | Especialista en Ventas & Cierre | `gemini-2.5-flash` | Prospección outbound en 3 impactos, calificación y links de cobro 1-clic. |
| **`cfo-financial-strategist`** | Director Financiero & Precios | `gemini-2.5-flash` | Custodio del presupuesto ($300 USD/día — $9,000 USD/mes), unit economics (LTV/CAC > 4.5x) y precios oficiales. |
| **`international-trade-specialist`** | Especialista en Comercio Exterior | `gemini-2.5-flash` | Expansión multijurisdicción, cumplimiento cambiario y enrutamiento cross-border. |
| **`consumer-psychology-diagnostician`** | Psicólogo de Ventas | `gemini-2.5-flash` | Auditoría de sesgos (aversión a la pérdida), desactivación preventiva de objeciones. |

---

## 💰 Catálogo de Precios Oficial (USD)

| Nivel / Agente | Precio Mensual (USD) | Pago Anual (USD - Ahorro 2 Meses) | Entrega |
| :--- | :--- | :--- | :--- |
| **Diagnóstico Flash Express** | **$19** (pago único) | N/A | Diagnóstico exhaustivo + arquitectura preliminar |
| **Agente Soporte & Concierge** | **$49 / mes** | **$490 / año** | Full Cloud 24/7 o descarga `.zip` |
| **Agente Directora de Mercadeo** | **$59 / mes** | **$590 / año** | Integración Buffer/LinkedIn + generación de copys |
| **Agente Custodio de Inventarios** | **$69 / mes** | **$690 / año** | Monitor ERP/Shopify + alertas de reposición |
| **Agente Closer de Ventas B2B** | **$79 / mes** | **$790 / año** | Cadencias 3 impactos + links de pago instantáneos |
| **Agente Auditor Financiero & Cobranza** | **$89 / mes** | **$890 / año** | Conciliación bancaria + recordatorios fiduciarios |
| **👑 Suite Élite Completa (5 Agentes)** | **$249 / mes** | **$2,490 / año** | Ecosistema integral con orquestador centralizado |

---

## 💳 Pasarelas de Pago Seguras

- **Strike Lightning Network**:
  - Pagos instantáneos en Bitcoin Lightning o USD sin comisiones de intermediarios.
  - Dirección receptora fiduciaria: `rick2818@strike.me`
  - Invoices dinámicos y webhooks con firma criptográfica `v1`.
- **Wompi SV (Bancolombia / El Salvador)**:
  - Enlaces de pago 3DSecure con soporte de tarjetas internacionales Visa, Mastercard y transferencias QR.
  - Validación de firma bancaria `X-Event-Checksum` (HMAC SHA-256).

---

## ☁️ Despliegue en Vercel (1-Clic Serverless)

El proyecto incluye configuración nativa para **Vercel** (`vercel.json`, `package.json` y `api/index.js`).

### Despliegue Automático:
```bash
# Iniciar sesión en Vercel
vercel login

# Desplegar directamente a producción
vercel --prod
```

### Endpoints Serverless Expuestos:
- `GET /api/catalog`: Retorna el catálogo oficial con precios y direcciones fiduciarias.
- `POST /api/strike/invoice`: Genera una factura Lightning para liquidación inmediata.
- `POST /api/wompi/checkout`: Construye la URL de pasarela Wompi con parámetros firmados.
- `POST /api/webhooks/strike`: Recibe y valida notificaciones de pago Strike.
- `POST /api/webhooks/wompi`: Recibe y valida notificaciones bancarias Wompi.

---

## 🗄️ Base de Datos & Autenticación (Supabase)

- **Instancia Oficial**: `https://iocwkuvkjeyonqosetvj.supabase.co`
- **Script SQL de Migración**: `supabase_schema.sql`

### Pasos para Aplicar en Supabase:
1. Accede a tu dashboard en [Supabase](https://supabase.com/dashboard/project/iocwkuvkjeyonqosetvj).
2. Abre el **SQL Editor**.
3. Copia y pega el contenido completo de [`supabase_schema.sql`](./supabase_schema.sql).
4. Ejecuta el script (`RUN`).
5. **Seguridad Aplicada**:
   - `search_path = public, pg_temp` en funciones `SECURITY DEFINER` (prevención de search path hijacking).
   - RLS activo en `clients`, `referrals` y `referral_conversions`.
   - Índices creados en foreign keys para búsquedas ultrarrápidas.
   - Hashing `bcrypt` con `pgcrypto`.

---

## 📱 Operación Móvil 24/7 en Telegram

El bot opera conectado a Vercel Serverless con inteligencia Gemini 3.6 Flash y voz Gemini Flash TTS:
- **Bot Oficial:** [`@ricardo_asistente_2026_bot`](https://t.me/ricardo_asistente_2026_bot) (`Asistente_ejecutivo_bot`)
- **Modo Fantasma (Zero-Trust):** Restringido al usuario maestro autorizado (Chat ID: `6311509947`).
- **Comandos Soportados:** Texto libre, notas de voz (`.oga`), `/start`, `/btc` (precio satoshis), `/flights`, `/calendar`, `/balance`.

### Inspección del Webhook en Telegram:
```bash
# Consultar estado del webhook en Telegram
node scripts/deploy_cloud_webhook.mjs --status

# Vincular nuevo dominio a Telegram Webhook
node scripts/deploy_cloud_webhook.mjs https://destraba-ai.vercel.app
```

---

## 🧪 Suite de Pruebas Fiduciarias Automatizadas

```bash
# 1. Validación de Primitivas Criptográficas y Sanitización (SOC-2)
node tests/test_fiduciary_core.mjs

# 2. Validación de Master Cloud Dispatcher (Cron 24/7)
node tests/test_master_dispatcher.mjs

# 3. Simulación de Webhook Serverless Telegram
node tests/test_telegram_serverless.mjs

# 4. Tests Unitarios del Generador
python -m unittest discover tests
```

---

## 📖 Documentación & Soporte

- **Manual de Usuario Completo**: [`MANUAL_DE_USUARIO_APP.md`](./MANUAL_DE_USUARIO_APP.md)
- **Estrategia Desatendida**: [`.agents/knowledge/ESTRATEGIA_VENTAS_DESATENDIDA_PARETO.md`](./.agents/knowledge/ESTRATEGIA_VENTAS_DESATENDIDA_PARETO.md)
- **Estudio de Mercado & Pricing**: [`.agents/knowledge/ESTUDIO_MERCADO_Y_PRICING_POR_AGENTE.md`](./.agents/knowledge/ESTUDIO_MERCADO_Y_PRICING_POR_AGENTE.md)
- **Soporte Oficial**: `soporte@destraba.ai` / `support@unblock.ai`

---
*Destraba AI / Unblock AI © 2026. Todos los derechos reservados.*
