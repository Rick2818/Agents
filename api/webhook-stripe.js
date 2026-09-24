import { handleStripeWebhookEvent } from '../lib/billing_settlement_sentinel.js';

// Vercel / Node.js config para recibir raw body si aplica
export const config = {
  api: {
    bodyParser: false
  }
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    let rawBody;
    if (req.body && Buffer.isBuffer(req.body)) {
      rawBody = req.body;
    } else if (typeof req.body === 'string') {
      rawBody = Buffer.from(req.body);
    } else {
      rawBody = await getRawBody(req);
    }

    const result = await handleStripeWebhookEvent(rawBody, sig);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Stripe webhook processing error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
}
