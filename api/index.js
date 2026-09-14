import {
  PRICING_CATALOG,
  buildWompiCheckoutUrl,
  createStrikeInvoice,
  verifyWompiSignature,
  verifyStrikeSignature,
  checkRateLimit,
  isIdempotent
} from '../lib/payment_security.js';

export default async function handler(req, res) {
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
        catalog: PRICING_CATALOG
      });
    }

    if (req.method === 'POST' && (pathname === '/api/strike/invoice' || pathname.endsWith('/strike/invoice'))) {
      const { planId, customerEmail, customerName } = req.body || {};
      const plan = PRICING_CATALOG[planId];
      if (!plan) {
        return res.status(400).json({ error: 'Invalid planId' });
      }

      const invoice = await createStrikeInvoice({
        amountUsd: plan.priceUsd,
        description: `Destraba AI: Licencia ${plan.name} para ${customerName || customerEmail || 'Cliente'}`,
        correlationId: `destraba_${planId}_${Date.now()}`
      });

      return res.status(200).json({ success: true, invoice });
    }

    if (req.method === 'POST' && (pathname === '/api/wompi/checkout' || pathname.endsWith('/wompi/checkout'))) {
      const { planId, customerEmail, redirectUrl } = req.body || {};
      const plan = PRICING_CATALOG[planId];
      if (!plan) {
        return res.status(400).json({ error: 'Invalid planId' });
      }

      const checkout = buildWompiCheckoutUrl({
        planId,
        amountInCents: plan.priceUsd * 100,
        currency: 'USD',
        customerEmail,
        redirectUrl: redirectUrl || `https://${req.headers.host}/dashboard.html?status=paid`
      });

      return res.status(200).json({ success: true, checkout });
    }

    if (req.method === 'POST' && (pathname === '/api/webhooks/wompi' || pathname.endsWith('/webhooks/wompi'))) {
      const checksumHeader = req.headers['x-event-checksum'];
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const secret = process.env.WOMPI_INTEGRITY_SECRET || 'destraba_default_secret';

      if (!verifyWompiSignature(rawBody, checksumHeader, secret)) {
        return res.status(401).json({ error: 'Invalid Wompi Signature' });
      }

      const eventId = req.body?.data?.transaction?.id || `wompi_${Date.now()}`;
      if (!isIdempotent(eventId)) {
        return res.status(200).json({ status: 'ignored_duplicate' });
      }

      return res.status(200).json({ status: 'processed', transactionId: eventId });
    }

    if (req.method === 'POST' && (pathname === '/api/webhooks/strike' || pathname.endsWith('/webhooks/strike'))) {
      const strikeSig = req.headers['x-strike-signature'];
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const webhookSecret = process.env.STRIKE_WEBHOOK_SECRET || 'strike_default_secret';

      if (!verifyStrikeSignature(rawBody, strikeSig, webhookSecret)) {
        return res.status(401).json({ error: 'Invalid Strike Signature' });
      }

      const invoiceId = req.body?.data?.id || `strike_${Date.now()}`;
      if (!isIdempotent(invoiceId)) {
        return res.status(200).json({ status: 'ignored_duplicate' });
      }

      return res.status(200).json({ status: 'processed', invoiceId });
    }

    return res.status(404).json({ error: 'Not Found', path: pathname });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
