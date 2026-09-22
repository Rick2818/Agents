/**
 * =============================================================================
 * RUNTIME DUAL LOCAL & DOCKER: SERVIDOR EXPRESS FIDUCIARIO (7 PILARES)
 * =============================================================================
 * Comparte lógica fiduciaria en /lib con endpoints serverless de /api
 * SOC-2 | 100% In-Memory RAM | Banking Security Headers | Rate Limiting
 * =============================================================================
 */

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import {
  applyStrictBankingHeaders,
  resolveCorsOrigin,
  checkRateLimit
} from './lib/fiduciary_core.js';

// Cargar variables de entorno locales si no están inyectadas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.resolve(__dirname, '.env');

if (fs.existsSync(ENV_PATH)) {
  const content = fs.readFileSync(ENV_PATH, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (k && !process.env[k]) process.env[k] = v;
      }
    }
  });
}

// Importar controladores de /api
import mainApiHandler from './api/index.js';
import telegramApiHandler from './api/telegram.js';
import masterDispatcherHandler from './api/cron/master-dispatcher.js';
import aiApiHandler from './api/ai.js';
import crmApiHandler from './api/crm.js';
import whatsappApiHandler from './api/whatsapp.js';
import intelApiHandler from './api/intel.js';

const app = express();
const PORT = process.env.PORT || 8765;

// PILAR 5: Límite estricto de buffers en RAM (Anti-DoS) & Preservación de Raw Body para HMAC
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// PILAR 6 & 7: Cabeceras Bancarias y CORS Aislado
app.use((req, res, next) => {
  applyStrictBankingHeaders(res);

  const requestOrigin = req.headers.origin;
  const allowedOrigin = resolveCorsOrigin(requestOrigin, true);
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Strike-Signature, X-Event-Checksum, X-Telegram-Bot-Api-Secret-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // PILAR 6: Rate limiting general
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const { allowed, remainingSeconds } = checkRateLimit(clientIp, 60, 60000);
  if (!allowed) {
    res.setHeader('Retry-After', remainingSeconds);
    return res.status(429).json({ error: 'Too Many Requests', retryAfterSeconds: remainingSeconds });
  }

  next();
});

// Manejo defensivo de fallos a nivel de proceso (Pilar 3 & 7)
process.on('uncaughtException', (err) => {
  console.error('💥 [CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [CRITICAL] Unhandled Rejection:', reason);
});

// Wrapper fiduciario para handlers asíncronos (evita que un error tire el proceso)
function safeHandler(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      console.error('[SERVER ERROR en ruta asíncrona]:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error', message: err?.message || 'Error interno' });
      }
    }
  };
}

// 1. ENDPOINT TELEGRAM WEBHOOK 24/7
app.all('/api/telegram', safeHandler(async (req, res) => {
  await telegramApiHandler(req, res);
}));

// 2. MASTER CLOUD DISPATCHER
app.all('/api/cron/master-dispatcher', safeHandler(async (req, res) => {
  await masterDispatcherHandler(req, res);
}));

// 2.2 VERCEL AI SDK (STREAMING & CHAT)
app.all('/api/ai', safeHandler(async (req, res) => {
  await aiApiHandler(req, res);
}));

// 2.3 CRM INTEGRATION (HUBSPOT & SALESFORCE)
app.all(/^\/api\/crm(\/.*)?$/, safeHandler(async (req, res) => {
  await crmApiHandler(req, res);
}));

// 2.4 WHATSAPP BUSINESS & TWILIO
app.all(/^\/api\/whatsapp(\/.*)?$/, safeHandler(async (req, res) => {
  await whatsappApiHandler(req, res);
}));

// 2.45 LEAD INTELLIGENCE (TAVILY)
app.all(/^\/api\/intel(\/.*)?$/, safeHandler(async (req, res) => {
  await intelApiHandler(req, res);
}));

// 2.5 CONFIGURACIÓN LOCAL DE CABINA SOBERANA
app.get('/api/cockpit/config', (req, res) => {
  res.json({
    geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
    authorizedUserId: (process.env.TELEGRAM_AUTHORIZED_USER_ID || '6311509947').trim(),
    strikeAddress: (process.env.STRIKE_LIGHTNING_ADDRESS || 'rick2818@strike.me').trim(),
    serverOnline: true
  });
});

// 3. API REST GENERAL (Catálogo, Strike, Wompi, MCP Hub)
// Compatible universalmente con Express 4 y Express 5
app.all(/^\/api(\/.*)?$/, safeHandler(async (req, res) => {
  await mainApiHandler(req, res);
}));

// 4. ARCHIVOS ESTÁTICOS FRONTEND (PROTECCIÓN ESTRICTA CONTRA FUGA DE SECRETOS CWE-200 / CWE-552)
// Bloqueo total de dotfiles, archivos de configuración, secretos y código fuente de backend
const BLOCKED_STATIC_EXTENSIONS = new Set([
  '.env', '.json', '.js', '.mjs', '.yml', '.yaml', '.zip', '.patch', '.sh', '.key', '.pem', '.log'
]);

app.use((req, res, next) => {
  const cleanPath = (req.path || '').toLowerCase();
  
  // 1. Bloquear cualquier intento de acceso a dotfiles (.env, .git, etc.)
  if (cleanPath.includes('/.') || cleanPath.startsWith('.')) {
    return res.status(403).json({ error: 'Access Denied: Forbidden resource' });
  }

  // 2. Bloquear extensiones sensibles de backend
  const ext = path.extname(cleanPath);
  if (BLOCKED_STATIC_EXTENSIONS.has(ext)) {
    return res.status(403).json({ error: 'Access Denied: Protected server resource' });
  }

  next();
});

app.use(express.static(__dirname, {
  dotfiles: 'deny',
  index: false
}));

// Rutas de conveniencia
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});
app.get('/cockpit', (req, res) => {
  res.sendFile(path.join(__dirname, 'COCKPIT_EJECUTIVO_RICARDO.html'));
});
app.get('/cabina', (req, res) => {
  res.sendFile(path.join(__dirname, 'COCKPIT_EJECUTIVO_RICARDO.html'));
});
app.get('/executive-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'executive_dashboard.html'));
});
app.get('/dashboard-ejecutivo', (req, res) => {
  res.sendFile(path.join(__dirname, 'executive_dashboard.html'));
});
app.get('/readme', (req, res) => {
  res.sendFile(path.join(__dirname, 'LEER_README.html'));
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`\n🛡️ =======================================================`);
  console.log(`✅ RUNTIME DUAL EXPRESS INICIADO: http://localhost:${PORT}`);
  console.log(`📡 Endpoints Serverless Activos: /api/telegram, /api/cron/master-dispatcher`);
  console.log(`🔒 Ciberseguridad Bancaria: 100% In-Memory RAM | CORS Whitelist | Anti-DoS`);
  console.log(`🛡️ =======================================================\n`);
});

// Apagado elegante
const shutdown = () => {
  console.log('Cerrando servidor fiduciario...');
  server.close(() => process.exit(0));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
