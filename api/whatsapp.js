/**
 * =============================================================================
 * ENDPOINT SERVERLESS: WHATSAPP BUSINESS & SMS (TWILIO)
 * =============================================================================
 * Rutas:
 *   GET  /api/whatsapp  -> Estado de conexión Twilio
 *   POST /api/whatsapp  -> Despacho de mensaje WhatsApp
 * =============================================================================
 */

import {
  applyStrictBankingHeaders,
  resolveCorsOrigin,
  checkRateLimit
} from '../lib/fiduciary_core.js';
import {
  getWhatsAppStatus,
  sendWhatsAppMessage
} from '../lib/whatsapp_engine.js';

export default async function handler(req, res) {
  applyStrictBankingHeaders(res);

  const requestOrigin = req.headers.origin;
  const allowedOrigin = resolveCorsOrigin(requestOrigin, process.env.NODE_ENV !== 'production');
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const { allowed, remainingSeconds } = checkRateLimit(clientIp, 30, 60000);
  if (!allowed) {
    res.setHeader('Retry-After', remainingSeconds);
    return res.status(429).json({ error: 'Too Many Requests', retryAfterSeconds: remainingSeconds });
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json(getWhatsAppStatus());
    }

    if (req.method === 'POST') {
      const { to, body, mediaUrl } = req.body || {};
      if (!to || !body) {
        return res.status(400).json({
          success: false,
          error: 'Los parámetros "to" y "body" son obligatorios.'
        });
      }

      const result = await sendWhatsAppMessage({ to, body, mediaUrl });
      return res.status(result.success ? 200 : 422).json(result);
    }

    return res.status(405).json({ error: 'Método HTTP no permitido' });
  } catch (error) {
    console.error('[WhatsApp API Error]:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Error interno en servicio WhatsApp'
    });
  }
}
