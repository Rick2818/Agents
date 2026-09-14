# ⚡ Destraba AI / Unblock AI

> **"Destraba tu empresa en 60 segundos. Activa tu agente soberano hoy y pon tu negocio en piloto automático."**  
> *"Unblock your business in 60 seconds. Deploy your autonomous agent today and put operations on autopilot."*

Plataforma fiduciaria B2B, simple, bilingüe (Español / English) y de máxima ciberseguridad, diseñada para transformar **dolores operativos no resueltos** en **Custom Agents autónomos** listos para producción en **Google Antigravity**, impulsados nativamente por **Gemini Flash 2.5**.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com)
[![Supabase Database](https://img.shields.io/badge/Supabase-Hardened%20Postgres-3ECF8E?logo=supabase)](https://iocwkuvkjeyonqosetvj.supabase.co)
[![Bitcoin Lightning](https://img.shields.io/badge/Strike-Lightning%20USD-FFD700?logo=bitcoin)](https://strike.me)
[![Python Tests](https://img.shields.io/badge/Tests-Passing%20100%25-brightgreen)](https://github.com/Rick2818/Agents)

---

## 🏛️ Propuesta de Valor y Experiencia

1. **Panel Directivo Bilingüe**: Selector dinámico Español / English sin recargar la app.
2. **Motor Gemini Flash 2.5**: Respuestas fiduciarias ultrarrápidas, síntesis rigurosa y nulo desperdicio de tokens.
3. **Cero Intervención Humana**: Prospección, calificación, cotización y cobro 100% automatizados con webhooks firmados criptográficamente.
4. **Ciberseguridad de Grado Bancario**:
   - Acceso perimetral controlado por Clave Maestra SHA-256 (`antigravity2026!`) con bloqueo tras 3 intentos fallidos.
   - Prevención de ataques de canal lateral con validación temporalmente constante (`timingSafeCompare`).
   - Rate-limiting en memoria con poda periódica (TTL 5 min).
   - Verificación estricta de firmas HMAC SHA-256 (`X-Strike-Signature`, `X-Event-Checksum`).
   - Cabeceras bancarias estrictas (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`).
5. **Autonomía y Descarga Inmediata**:
   - Despliegue serverless en Vercel 24/7 o descarga en 1 clic del paquete `.agents/` en formato `.zip`.

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

## 🚀 Inicio Rápido Local

### 1. Iniciar la Plataforma Web
Haz doble clic en:
```bat
ABRIR_PLATAFORMA.bat
```
O ábrelo en tu navegador:
```bash
start dashboard.html
```

### 2. Iniciar el Gateway Local de Pagos
```bash
node scripts/payments_gateway_server.mjs
```

### 3. Ejecutar Suite de Tests
```bash
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
