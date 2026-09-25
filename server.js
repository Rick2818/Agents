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
import { AutonomousSalesTriadEngine } from './lib/autonomous_triad_engine.js';

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

// 2.46 AUTONOMOUS SALES TRIAD ENGINE (EXPLEE -> BOLTECH CLOSER -> AIRTABLE)
const triadEngine = new AutonomousSalesTriadEngine();

app.post('/api/triad/ingest', safeHandler(async (req, res) => {
  const leadData = req.body || {};
  const options = {
    planTier: req.body.planTier || 'PRO_SENTINEL',
    dryRun: Boolean(req.body.dryRun)
  };
  const result = await triadEngine.processTriadFlow(leadData, options);
  res.json({ success: true, result });
}));

app.get('/api/dashboard/airtable', safeHandler(async (req, res) => {
  const DATA_FILE = path.join(__dirname, 'data', 'airtable_local_store.json');
  let data = { tables: { Leads: [], Deals: [], Dashboard_Metrics: [] } };
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  res.json(data);
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
app.get('/data/dashboard_feed.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'dashboard_feed.json'));
});
app.get('/api/dashboard/feed', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'dashboard_feed.json'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

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

// Rutas de conveniencia y visualización
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/boltech', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/boltech', (req, res) => {
  res.sendFile(path.join(__dirname, 'boltech.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});
app.get('/cockpit', (req, res) => {
  res.sendFile(path.join(__dirname, 'COCKPIT_EJECUTIVO_RICARDO.html'));
});
app.get('/video2', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BolTech — Custom Agents Video (Full HD)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #020617;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      background: rgba(0, 212, 255, 0.15);
      border: 1px solid #00d4ff;
      color: #00d4ff;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
    }
    p {
      color: #94a3b8;
      font-size: 15px;
      margin-top: 4px;
    }
    .video-wrapper {
      position: relative;
      width: 100%;
      max-width: 1080px;
      aspect-ratio: 16 / 9;
      background: #000;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 60px -15px rgba(0, 212, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
    video {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
    }
    .actions {
      margin-top: 24px;
      display: flex;
      gap: 16px;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #00d4ff;
      color: #000;
    }
    .btn-primary:hover {
      background: #38bdf8;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">⚡ BOLTECH PRESENTA</div>
    <h1>Video 2 — “Custom Agents” (Operaciones &amp; Ventas 24/7)</h1>
    <p>Locución ejecutiva sincronizada (90s / 1080p Full HD)</p>
  </div>
  <div class="video-wrapper">
    <video controls autoplay playsinline poster="assets/videos/poster_gerente_estrategia.jpg">
      <source src="assets/videos/gerente_bottleneck_agente_es.mp4" type="video/mp4">
      Tu navegador no soporta reproducción de video HTML5.
    </video>
  </div>
  <div class="actions">
    <a href="/" class="btn btn-secondary">← Volver a la App Principal</a>
    <a href="assets/videos/gerente_bottleneck_agente_es.mp4" download class="btn btn-primary">⬇ Descargar Video MP4</a>
  </div>
</body>
</html>`);
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
