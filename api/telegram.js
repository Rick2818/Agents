/**
 * =============================================================================
 * ENDPOINT SERVERLESS: TELEGRAM CLOUD WEBHOOK 24/7 (VERCEL & AWS LAMBDA)
 * =============================================================================
 * Ruta: POST /api/telegram
 * SOC-2 | Zero-Trust | Cero Dependencia Local | 100% In-Memory RAM
 * =============================================================================
 */

import {
  timingSafeCompare,
  checkRateLimit,
  applyStrictBankingHeaders,
  getRequiredEnv
} from '../lib/fiduciary_core.js';
import { processCloudTelegramUpdate } from '../lib/telegram_cloud_processor.js';

// Cache de deduplicación en memoria para evitar reprocesar reintentos de Telegram
const processedUpdatesCache = new Map();
const UPDATE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
const MAX_UPDATE_CACHE_SIZE = 1000;

function isUpdateDuplicate(updateId) {
  if (!updateId) return false;
  const now = Date.now();
  if (processedUpdatesCache.has(updateId)) {
    return true;
  }
  processedUpdatesCache.set(updateId, now);
  // Limpieza periódica de entradas vencidas
  if (processedUpdatesCache.size > MAX_UPDATE_CACHE_SIZE) {
    for (const [id, time] of processedUpdatesCache.entries()) {
      if (now - time > UPDATE_CACHE_TTL_MS) {
        processedUpdatesCache.delete(id);
      }
    }
  }
  return false;
}

export default async function handler(req, res) {
  applyStrictBankingHeaders(res);

  // Manejo de pre-flight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Comprobación de salud GET
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ONLINE',
      mode: 'CLOUD_NATIVE_SERVERLESS_24_7',
      agent: '@ricardo_asistente_2026_bot',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // PILAR 6: Rate Limiting en Serverless (Anti-DoS / Anti-Flooding)
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'telegram-edge';
  const { allowed, remainingSeconds } = checkRateLimit(clientIp, 60, 60000);
  if (!allowed) {
    res.setHeader('Retry-After', remainingSeconds);
    return res.status(429).json({ error: 'Too Many Requests', retryAfterSeconds: remainingSeconds });
  }

  // PILAR 4: Verificación Criptográfica Obligatoria del Token Secreto de Webhook
  const expectedSecret = (process.env.TELEGRAM_WEBHOOK_SECRET || '').trim();
  if (!expectedSecret) {
    console.error('[CRITICAL SECURITY CONFIG]: TELEGRAM_WEBHOOK_SECRET no está configurado en el servidor.');
    return res.status(500).json({ error: 'Server misconfiguration: TELEGRAM_WEBHOOK_SECRET is required' });
  }

  const incomingSecret = req.headers['x-telegram-bot-api-secret-token'];
  if (!incomingSecret || !timingSafeCompare(incomingSecret, expectedSecret)) {
    console.warn('[SEGURIDAD CLOUD] Intento de webhook con token secreto inválido o ausente.');
    return res.status(401).json({ error: 'Unauthorized Webhook Source' });
  }

  try {
    const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Deduplicación rápida por update_id
    if (update?.update_id && isUpdateDuplicate(update.update_id)) {
      console.log(`[DEDUPE]: Update #${update.update_id} ya procesado recientemente. Ignorando reintento.`);
      return res.status(200).json({ ok: true, duplicate: true });
    }

    // Procesar actualización de Telegram en memoria RAM
    const result = await processCloudTelegramUpdate(update, process.env);

    return res.status(200).json({ ok: true, result });
  } catch (err) {
    // PILAR 7: Cero fuga de stack traces a clientes externos
    console.error('[TELEGRAM SERVERLESS ERROR]:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
