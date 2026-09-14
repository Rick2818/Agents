# ⚡ Destraba AI

> **"Destraba tu empresa en 60 segundos. Activa tu agente soberano hoy y pon tu negocio en piloto automático."**

Plataforma fiduciaria B2B, simple, minimalista y de máxima ciberseguridad, diseñada para transformar **dolores operativos no resueltos** en **Custom Agents autónomos** listos para producción en **Google Antigravity**, impulsados nativamente por **Gemini Flash 2.5**.

---

## 🏛️ Propuesta de Valor y Experiencia Minimalista

1. **Espacio para el Cliente**: Un portal interactivo moderno donde el directivo describe en lenguaje natural su fricción operativa y recibe en menos de 60 segundos su arquitectura personalizada.
2. **Motor Gemini Flash 2.5**: Respuestas fiduciarias ultrarrápidas, síntesis rigurosa y nulo desperdicio de tokens.
3. **Cero Intervención Humana**: Prospección, calificación, cotización y cobro 100% automatizados con webhooks firmados criptográficamente.
4. **Ciberseguridad de Grado Bancario**:
   - Acceso perimetral controlado por Clave Maestra SHA-256 (`antigravity2026!`) con bloqueo tras 3 intentos fallidos.
   - Prevención de ataques de canal lateral con validación temporalmente constante (`timingSafeCompare`).
   - Libro mayor de idempotencia en memoria (`idempotencyKey`).
   - Cabeceras bancarias estrictas (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`).
5. **Autonomía y Descarga Inmediata**:
   - Despliegue en la nube 24/7 o descarga en 1 clic del paquete `.agents/` en formato `.zip`.

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
  - Pagos instantáneos en Bitcoin Lightning o USD sin comisiones abusivas.
  - Dirección receptora oficial: `rick2818@strike.me`
  - Protocolo LNURL / Lightning Invoice con validación de hash y webhook verificado.
- **Wompi SV (Bancolombia / El Salvador)**:
  - Enlaces de pago 3DSecure con soporte de tarjetas internacionales Visa, Mastercard y transferencias QR.
  - Validación de firma bancaria `X-Event-Checksum` (HMAC SHA-256).

---

## 🗄️ Base de Datos & Autenticación (Supabase)

- **Instancia Oficial**: `https://iocwkuvkjeyonqosetvj.supabase.co`
- **Esquema SQL**: `supabase_schema.sql`
- **Características**:
  - Extensión `pgcrypto` con hashing unidireccional `crypt(password, gen_salt('bf', 10))`.
  - Tabla `clients` con control de tarifas (`pricing_tier`), estado de suscripción y límites de agentes.
  - Procedimientos almacenados seguros: `register_client` y `verify_client_login`.
  - Row Level Security (RLS) para aislamiento estricto de tenants.

---

## 🚀 Inicio Rápido

### 1. Iniciar la Plataforma Web
Haz doble clic en:
```bat
ABRIR_PLATAFORMA.bat
```
O ábrelo en tu navegador:
```bash
start dashboard.html
```

### 2. Iniciar el Servidor de Pagos y Webhooks
```bash
node scripts/payments_gateway_server.mjs
```

### 3. Ejecutar la Suite de Pruebas Unitarias
```bash
python -m unittest discover tests
```

---

## 📖 Documentación & Soporte

- **Manual de Usuario Completo**: [`MANUAL_DE_USUARIO_APP.md`](./MANUAL_DE_USUARIO_APP.md)
- **Estrategia Desatendida**: [`.agents/knowledge/ESTRATEGIA_VENTAS_DESATENDIDA_PARETO.md`](./.agents/knowledge/ESTRATEGIA_VENTAS_DESATENDIDA_PARETO.md)
- **Estudio de Mercado & Pricing**: [`.agents/knowledge/ESTUDIO_MERCADO_Y_PRICING_POR_AGENTE.md`](./.agents/knowledge/ESTUDIO_MERCADO_Y_PRICING_POR_AGENTE.md)
- **Soporte Técnico Oficial**: `soporte@destraba.ai`

---
*Destraba AI © 2026. Todos los derechos reservados.*
