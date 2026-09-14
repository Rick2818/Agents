
import {
  StrikeLightningGateway,
  WompiGateway,
  CATALOGO_PRECIOS_USD,
  applyBankingSecurityHeaders,
  checkRateLimit,
  recordAndVerifyIdempotency
} from '../lib/payment_security.js';

// Instancias reutilizadas entre invocaciones cálidas (evita recrear el cliente en cada request)
const strike = new StrikeLightningGateway({ lightningAddress: 'rick2818@strike.me' });
const wompi = new WompiGateway({
  appId: process.env.WOMPI_APP_ID || '',
  apiSecret: process.env.WOMPI_API_SECRET || '',
  webhookSecret: process.env.WOMPI_WEBHOOK_SECRET || ''
});

export default async function handler(req, res) {
  applyBankingSecurityHeaders(res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Strike-Signature, X-Event-Checksum');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown-client';
  if (!checkRateLimit(clientIp, 60, 60000)) {
    return res.status(429).json({ error: 'Too Many Requests', retryAfterSeconds: 60 });
  }

  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    if (req.method === 'GET' && (pathname === '/api/catalog' || pathname.endsWith('/catalog'))) {
      return res.status(200).json({
        success: true,
        brand: 'Destraba AI / Unblock AI',
        supportEmail: 'soporte@destraba.ai',
        strikeLightningAddress: 'rick2818@strike.me',
        catalog: CATALOGO_PRECIOS_USD
      });
    }

    if (req.method === 'POST' && (pathname === '/api/strike/invoice' || pathname.endsWith('/strike/invoice'))) {
      const { planId, customerEmail } = req.body || {};
      const invoice = await strike.createLightningPayment(planId, customerEmail);
      return res.status(200).json({ success: true, invoice });
    }

    if (req.method === 'POST' && (pathname === '/api/wompi/checkout' || pathname.endsWith('/wompi/checkout'))) {
      const { planId, customerEmail, redirectUrl } = req.body || {};
      const checkout = await wompi.createPaymentLink(
        planId,
        customerEmail,
        redirectUrl || `https://${req.headers.host}/dashboard.html?status=paid`
      );
      return res.status(200).json({ success: true, checkout });
    }

    // --- Webhooks: fallan CERRADOS si el secreto no está configurado (antes caían a un ---
    // --- string por defecto público en el repo, lo que permitía falsificar pagos).      ---
    if (req.method === 'POST' && (pathname === '/api/webhooks/wompi' || pathname.endsWith('/webhooks/wompi'))) {
      if (!process.env.WOMPI_WEBHOOK_SECRET) {
        console.error('[CONFIG] WOMPI_WEBHOOK_SECRET no está definido — webhook rechazado por seguridad.');
        return res.status(503).json({ error: 'Webhook receiver not configured' });
      }

      const checksumHeader = req.headers['x-event-checksum'];
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      if (!wompi.verifyWebhookSignature(rawBody, checksumHeader)) {
        return res.status(401).json({ error: 'Invalid Wompi Signature' });
      }

      const eventId = req.body?.data?.transaction?.id || req.body?.idTransaccion;
      if (!eventId) {
        return res.status(400).json({ error: 'Missing transaction id' });
      }

      // NOTA: este ledger de idempotencia vive en memoria del proceso. En Vercel cada
      // invocación puede caer en una instancia distinta o "fría", así que NO garantiza
      // deduplicación real entre eventos. Para producción, mover a una tabla de Supabase
      // (p. ej. webhook_events con UNIQUE(event_id)) o a Upstash Redis.
      const idempotency = recordAndVerifyIdempotency(`wompi_${eventId}`);
      if (idempotency.isDuplicate) {
        return res.status(200).json({ status: 'ignored_duplicate', transactionId: eventId });
      }

      return res.status(200).json({ status: 'processed', transactionId: eventId });
    }

    if (req.method === 'POST' && (pathname === '/api/webhooks/strike' || pathname.endsWith('/webhooks/strike'))) {
      if (!process.env.STRIKE_WEBHOOK_SECRET) {
        console.error('[CONFIG] STRIKE_WEBHOOK_SECRET no está definido — webhook rechazado por seguridad.');
        return res.status(503).json({ error: 'Webhook receiver not configured' });
      }

      const strikeSig = req.headers['x-strike-signature'];
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      if (!strike.verifyWebhookSignature(rawBody, strikeSig)) {
        return res.status(401).json({ error: 'Invalid Strike Signature' });
      }

      const invoiceId = req.body?.data?.id;
      if (!invoiceId) {
        return res.status(400).json({ error: 'Missing invoice id' });
      }

      // Ver nota de idempotencia arriba — mismo riesgo en instancias serverless.
      const idempotency = recordAndVerifyIdempotency(`strike_${invoiceId}`);
      if (idempotency.isDuplicate) {
        return res.status(200).json({ status: 'ignored_duplicate', invoiceId });
      }

      return res.status(200).json({ status: 'processed', invoiceId });
    }

    return res.status(404).json({ error: 'Not Found', path: pathname });
  } catch (err) {
    // No se expone err.message al cliente: puede filtrar detalles internos.
    console.error('[API ERROR]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
