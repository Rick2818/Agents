/**
 * =============================================================================
 * ENDPOINT SERVERLESS: CRM INTEGRATIONS (HUBSPOT & SALESFORCE)
 * =============================================================================
 * Rutas:
 *   GET  /api/crm       -> Diagnóstico de estado de integración con CRM
 *   POST /api/crm/sync  -> Sincronización fiduciaria de lead calificado
 * SOC-2 | In-Memory RAM | Rate Limiting
 * =============================================================================
 */

import {
  applyStrictBankingHeaders,
  resolveCorsOrigin,
  checkRateLimit
} from '../lib/fiduciary_core.js';
import {
  getCRMStatus,
  syncLeadToCRM
} from '../lib/crm_integrations.js';

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

  // Rate Limiting perimetral
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const { allowed, remainingSeconds } = checkRateLimit(clientIp, 40, 60000);
  if (!allowed) {
    res.setHeader('Retry-After', remainingSeconds);
    return res.status(429).json({ error: 'Too Many Requests', retryAfterSeconds: remainingSeconds });
  }

  try {
    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // 1. GET: Estado de integración
    if (req.method === 'GET') {
      const status = getCRMStatus();
      return res.status(200).json(status);
    }

    // 2. POST: Sincronización de Lead
    if (req.method === 'POST') {
      const lead = req.body || {};
      if (!lead.email) {
        return res.status(400).json({
          success: false,
          error: 'El campo "email" es obligatorio para la sincronización con el CRM.'
        });
      }

      const syncResult = await syncLeadToCRM(lead);
      return res.status(200).json({
        success: true,
        data: syncResult
      });
    }

    return res.status(405).json({ error: 'Método HTTP no permitido' });
  } catch (error) {
    console.error('[CRM API Error]:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Error en la integración con CRM'
    });
  }
}
