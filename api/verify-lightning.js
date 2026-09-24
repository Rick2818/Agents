import { verifyAndSettleLightningPayment } from '../lib/billing_settlement_sentinel.js';

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
    const { transactionId, invoiceId, amountUSD, customerEmail, domain, planId } = req.body || {};

    if (!transactionId) {
      return res.status(400).json({ ok: false, error: 'transactionId requerido' });
    }

    const result = await verifyAndSettleLightningPayment({
      transactionId,
      invoiceId,
      amountUSD,
      customerEmail,
      domain,
      planId
    });

    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    console.error('Verify Lightning error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
