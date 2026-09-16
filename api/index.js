
import {
  StrikeLightningGateway,
  WompiGateway,
  CATALOGO_PRECIOS_USD,
  applyBankingSecurityHeaders,
  checkRateLimit,
  recordAndVerifyIdempotency
} from '../lib/payment_security.js';
import { ExecutiveAssistantMCPHub } from '../lib/mcp_executive_assistant.js';

// Instancias reutilizadas entre invocaciones cálidas (evita recrear el cliente en cada request)
const strike = new StrikeLightningGateway({ lightningAddress: 'rick2818@strike.me' });
const wompi = new WompiGateway({
  appId: process.env.WOMPI_APP_ID || '',
  apiSecret: process.env.WOMPI_API_SECRET || '',
  webhookSecret: process.env.WOMPI_WEBHOOK_SECRET || ''
});
const mcpHub = new ExecutiveAssistantMCPHub({ strikeAddress: 'rick2818@strike.me' });

import {
  applyStrictBankingHeaders,
  resolveCorsOrigin
} from '../lib/fiduciary_core.js';
import {
  sendCustomerDeliveryEmail,
  sendExecutiveTelegramAlert
} from '../lib/fiduciary_delivery.js';
import {
  dispatchUniversalEmail,
  inspectResendAccount,
  maskSecret
} from '../lib/universal_email_engine.js';
import telegramHandler from './telegram.js';
import cronHandler from './cron/master-dispatcher.js';

export default async function handler(req, res) {
  applyStrictBankingHeaders(res);

  const requestOrigin = req.headers.origin;
  const allowedOrigin = resolveCorsOrigin(requestOrigin, process.env.NODE_ENV !== 'production');
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Strike-Signature, X-Event-Checksum, X-Telegram-Bot-Api-Secret-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // Enrutamiento a Telegram Webhook Serverless
    if (pathname === '/api/telegram' || pathname.endsWith('/telegram')) {
      return await telegramHandler(req, res);
    }

    // Enrutamiento a Master Cloud Dispatcher Cron
    if (pathname === '/api/cron/master-dispatcher' || pathname.endsWith('/cron/master-dispatcher')) {
      return await cronHandler(req, res);
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown-client';
    if (!checkRateLimit(clientIp, 60, 60000)) {
      return res.status(429).json({ error: 'Too Many Requests', retryAfterSeconds: 60 });
    }

    // --- ENDPOINTS UNIVERSALES DE CORREO: ESTADO Y DESPACHO ---
    if (req.method === 'GET' && (pathname === '/api/email/status' || pathname.endsWith('/email/status'))) {
      const resendKey = process.env.RESEND_API_KEY || process.env.RESFND_APT_KEY;
      const resendAudit = await inspectResendAccount(resendKey);
      const isSmtpReady = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_PASS.trim().length >= 8);

      return res.status(200).json({
        success: true,
        smtp: {
          configured: isSmtpReady,
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT, 10) || 465,
          user: process.env.SMTP_USER || 'ricardo.destrabaai@gmail.com',
          from: process.env.SMTP_FROM || `Destraba AI <${process.env.SMTP_USER || 'ricardo.destrabaai@gmail.com'}>`,
          status: isSmtpReady ? 'OPERATIONAL_LIVE' : 'PENDING_APP_PASSWORD'
        },
        resend: {
          keyConfigured: Boolean(resendKey),
          keyMasked: maskSecret(resendKey),
          hasVerifiedDomain: resendAudit.hasVerifiedDomain || false,
          domainsCount: resendAudit.domainsCount || 0,
          domains: resendAudit.domains || [],
          mode: resendAudit.hasVerifiedDomain ? 'VERIFIED_DOMAIN_LIVE' : 'SANDBOX_OWNER_ONLY'
        },
        activeCarrier: isSmtpReady ? 'GMAIL_SMTPS' : (resendAudit.hasVerifiedDomain ? 'RESEND_VERIFIED' : 'RESEND_SANDBOX_DIGEST_ONLY'),
        hint: !isSmtpReady
          ? 'Ingresa tu contraseña de aplicación de Gmail (16 caracteres) en .env (SMTP_PASS) para habilitar envíos a terceros al 100% sin esperar verificación de dominio.'
          : 'Motor listo para despachar a cualquier tercero.'
      });
    }

    if (req.method === 'POST' && (pathname === '/api/email/dispatch' || pathname.endsWith('/email/dispatch'))) {
      const { to, subject, body, html } = req.body || {};
      if (!to || !subject || (!body && !html)) {
        return res.status(400).json({ success: false, error: 'Faltan campos requeridos: to, subject, body/html' });
      }

      const dispatchResult = await dispatchUniversalEmail({
        to,
        subject,
        text: body || '',
        html: html || ''
      });

      return res.status(dispatchResult.success ? 200 : 422).json(dispatchResult);
    }

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

    // --- MCP TOOL HUB: Asistente Personal Ejecutivo ---
    if ((req.method === 'POST' || req.method === 'GET') && (pathname === '/api/mcp/executive' || pathname.endsWith('/mcp/executive'))) {
      const action = (req.method === 'POST' ? req.body?.action : url.searchParams.get('action')) || 'all';
      const destination = (req.method === 'POST' ? req.body?.destination : url.searchParams.get('destination')) || 'Madrid';
      const category = (req.method === 'POST' ? req.body?.category : url.searchParams.get('category')) || 'cinema';
      const query = (req.method === 'POST' ? req.body?.query : url.searchParams.get('query')) || '';

      if (action === 'bitcoin') {
        const data = await mcpHub.getBitcoinData();
        return res.status(200).json({ success: true, tool: 'bitcoin_mcp', data });
      }
      if (action === 'flights') {
        const data = await mcpHub.searchFlightsFromSAL(destination, 'Próximos 14 días');
        return res.status(200).json({ success: true, tool: 'flights_sal_mcp', data });
      }
      if (action === 'venues') {
        const data = await mcpHub.searchSanSalvadorVenues(category, query);
        return res.status(200).json({ success: true, tool: 'venues_mcp', data });
      }
      if (action === 'google_workspace') {
        const data = await mcpHub.getGoogleWorkspaceStatus();
        return res.status(200).json({ success: true, tool: 'google_workspace_mcp', data });
      }
      if (action === 'spotify') {
        const data = await mcpHub.getSpotifyStatus();
        return res.status(200).json({ success: true, tool: 'spotify_mcp', data });
      }
      if (action === 'projects') {
        const data = await mcpHub.getProjectTrackingData();
        return res.status(200).json({ success: true, tool: 'project_tracker_mcp', data });
      }

      // Snapshot consolidado de todos los MCPs
      const [btc, flights, venues, gws, spotify, projects] = await Promise.all([
        mcpHub.getBitcoinData(),
        mcpHub.searchFlightsFromSAL('Madrid'),
        mcpHub.searchSanSalvadorVenues('cinema'),
        mcpHub.getGoogleWorkspaceStatus(),
        mcpHub.getSpotifyStatus(),
        mcpHub.getProjectTrackingData()
      ]);

      return res.status(200).json({
        success: true,
        agent: "Asistente Ejecutivo & Concierge Soberano",
        mcps: { btc, flights, venues, gws, spotify, projects }
      });
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

      // Cierre de Ciclo Fiduciario 10/10: Despacho de Blindaje y Alerta Push a Telegram
      const transaction = req.body?.data?.transaction || req.body;
      const status = transaction?.status || 'APPROVED';
      const customerEmail = transaction?.customer_email || req.body?.customerEmail;
      const amountInCents = transaction?.amount_in_cents || 1900;
      const amountUsd = (amountInCents / 100).toFixed(2);
      const reference = transaction?.reference || eventId;

      if (status === 'APPROVED') {
        Promise.allSettled([
          sendCustomerDeliveryEmail({
            toEmail: customerEmail,
            domain: reference,
            planId: 'flash_audit_19',
            invoiceId: eventId,
            amountUsd
          }),
          sendExecutiveTelegramAlert({
            gateway: 'Wompi Bancolombia / Card',
            invoiceId: eventId,
            amountUsd,
            customerEmail: customerEmail || '(Tarjeta Wompi)',
            domain: reference,
            status: 'LIQUIDADA'
          })
        ]).catch(err => console.error('[WOMPI POST-PAYMENT ERROR]', err));
      }

      return res.status(200).json({ status: 'processed', transactionId: eventId, delivered: status === 'APPROVED' });
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

      // Cierre de Ciclo Fiduciario 10/10: Despacho de Blindaje y Alerta Push a Telegram
      const data = req.body?.data || {};
      const state = data.state || req.body?.state || 'PAID';
      const amountUsd = data.amount?.amount || '19.00';
      const description = data.description || '';
      const correlationId = data.correlationId || '';
      const customerEmail = (correlationId.includes('@') ? correlationId : (description.includes('@') ? description : ''));
      const domain = correlationId && !correlationId.includes('@') ? correlationId : 'cliente-strike.com';

      if (state === 'PAID') {
        Promise.allSettled([
          sendCustomerDeliveryEmail({
            toEmail: customerEmail,
            domain,
            planId: amountUsd === '69.00' ? 'pro_hunter_69' : 'flash_audit_19',
            invoiceId,
            amountUsd
          }),
          sendExecutiveTelegramAlert({
            gateway: 'Strike Lightning Network',
            invoiceId,
            amountUsd,
            customerEmail: customerEmail || '(Lightning Anónimo)',
            domain,
            status: 'LIQUIDADA (Satoshis en RAM)'
          })
        ]).catch(err => console.error('[STRIKE POST-PAYMENT ERROR]', err));
      }

      return res.status(200).json({ status: 'processed', invoiceId, delivered: state === 'PAID' });
    }

    return res.status(404).json({ error: 'Not Found', path: pathname });
  } catch (err) {
    // No se expone err.message al cliente: puede filtrar detalles internos.
    console.error('[API ERROR]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
