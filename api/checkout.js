import { createStripeCheckoutSession, createCheckoutIntent } from '../lib/billing_settlement_sentinel.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { planId, customerEmail, domain, channel, successUrl, cancelUrl } = req.body || {};

    if (channel === 'stripe') {
      const session = await createStripeCheckoutSession({
        planId: planId || 'pro',
        customerEmail,
        domain,
        successUrl,
        cancelUrl
      });
      return res.status(200).json({ ok: true, ...session });
    }

    // Canal Strike Lightning por defecto
    const intent = createCheckoutIntent({
      planId: planId || 'pro',
      customerEmail,
      domain
    });

    return res.status(200).json({
      ok: true,
      transactionId: intent.transactionId,
      amountUSD: intent.amountUSD,
      strikeAddress: intent.strikeLightningAddress,
      strikeUrl: `https://strike.me/rick2818?amount=${intent.amountUSD}&note=${intent.transactionId}`
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
