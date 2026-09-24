#!/usr/bin/env node
/**
 * Boltech Payments MCP — Strike (Bitcoin Lightning) + Wompi Colombia (Nequi / Bancolombia / PSE)
 * Transporte stdio. NUNCA escribir a stdout (rompe el protocolo): los logs van a stderr.
 *
 * Variables de entorno:
 *   STRIKE_API_KEY        llave de Strike (idealmente solo con permisos de facturas)
 *   WOMPI_PRIVATE_KEY     prv_test_... (sandbox) o prv_prod_... (producción)
 *   WOMPI_ENV             "sandbox" (por defecto) o "production"
 *   USD_COP_RATE          opcional, p. ej. 4000 (solo si cobras indicando amount_usd)
 *   STRIKE_API_URL        opcional, por defecto https://api.strike.me/v1
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const STRIKE = process.env.STRIKE_API_URL || 'https://api.strike.me/v1';
const WOMPI = process.env.WOMPI_ENV === 'production'
  ? 'https://production.wompi.co/v1'
  : 'https://sandbox.wompi.co/v1';

/* ------------------------------ utilidades ------------------------------ */

function need(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta la variable de entorno ${name}. Configúrala en el bloque "env" del MCP.`);
  return v;
}

async function http(url, opts) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) {
    const detail = typeof body === 'string' ? body : JSON.stringify(body);
    throw new Error(`HTTP ${res.status} en ${new URL(url).host}: ${detail}`.slice(0, 600));
  }
  return body;
}

const ok = (obj) => ({ content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }] });
const fail = (e) => ({ content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true });
const safe = (fn) => async (args) => { try { return ok(await fn(args)); } catch (e) { console.error(e.message); return fail(e); } };

const strikeHeaders = () => ({
  Authorization: `Bearer ${need('STRIKE_API_KEY')}`,
  'Content-Type': 'application/json',
  Accept: 'application/json'
});
const wompiHeaders = () => ({
  Authorization: `Bearer ${need('WOMPI_PRIVATE_KEY')}`,
  'Content-Type': 'application/json'
});

function toCop({ amount_cop, amount_usd }) {
  if (amount_cop) return Math.round(amount_cop);
  if (amount_usd) {
    const rate = Number(need('USD_COP_RATE'));
    if (!(rate > 0)) throw new Error('USD_COP_RATE debe ser un número mayor que 0.');
    return Math.round(amount_usd * rate);
  }
  throw new Error('Indica amount_cop o amount_usd.');
}

/* -------------------------------- servidor -------------------------------- */

const server = new McpServer({ name: 'boltech-payments', version: '1.0.0' });

server.tool(
  'payments_status',
  'Indica qué pasarelas están configuradas (solo true/false, nunca muestra llaves).',
  {},
  safe(async () => ({
    strike: !!process.env.STRIKE_API_KEY,
    wompi: !!process.env.WOMPI_PRIVATE_KEY,
    wompi_env: process.env.WOMPI_ENV === 'production' ? 'production' : 'sandbox',
    usd_cop_rate_set: Number(process.env.USD_COP_RATE) > 0
  }))
);

server.tool(
  'strike_create_invoice',
  'Crea una factura Lightning en Strike (monto en USD) y devuelve el invoice BOLT11 para mostrar como QR o enlace lightning:.',
  {
    amount_usd: z.number().positive().describe('Monto en USD, p. ej. 19'),
    description: z.string().min(1).max(200).describe('Concepto del cobro'),
    reference: z.string().max(100).optional().describe('ID de pedido propio (correlationId); si se omite se genera uno')
  },
  safe(async ({ amount_usd, description, reference }) => {
    const ref = reference || `BOL-${Date.now()}`;
    const inv = await http(`${STRIKE}/invoices`, {
      method: 'POST',
      headers: strikeHeaders(),
      body: JSON.stringify({
        correlationId: ref,
        description,
        amount: { currency: 'USD', amount: amount_usd.toFixed(2) }
      })
    });
    const quote = await http(`${STRIKE}/invoices/${inv.invoiceId}/quote`, {
      method: 'POST',
      headers: strikeHeaders()
    });
    return {
      invoice_id: inv.invoiceId,
      reference: ref,
      amount_usd,
      bolt11: quote.lnInvoice,
      lightning_uri: `lightning:${quote.lnInvoice}`,
      expiration: quote.expiration ?? quote.expirationInSec ?? null
    };
  })
);

server.tool(
  'strike_get_invoice',
  'Consulta el estado de una factura de Strike (paid = true cuando el estado es PAID).',
  { invoice_id: z.string().min(1).describe('invoice_id devuelto por strike_create_invoice') },
  safe(async ({ invoice_id }) => {
    const inv = await http(`${STRIKE}/invoices/${encodeURIComponent(invoice_id)}`, { headers: strikeHeaders() });
    return {
      invoice_id,
      state: inv.state,
      paid: inv.state === 'PAID',
      amount: inv.amount,
      reference: inv.correlationId
    };
  })
);

server.tool(
  'wompi_create_payment_link',
  'Crea un enlace de pago de Wompi Colombia (el cliente elige Nequi, botón Bancolombia, PSE o tarjeta). Indica amount_cop o amount_usd (requiere USD_COP_RATE).',
  {
    name: z.string().min(1).max(64).describe('Nombre corto del cobro'),
    description: z.string().min(1).max(200).describe('Descripción visible para el cliente'),
    amount_cop: z.number().positive().optional().describe('Monto en pesos colombianos'),
    amount_usd: z.number().positive().optional().describe('Monto en USD (se convierte con USD_COP_RATE)'),
    single_use: z.boolean().default(true).describe('El enlace se puede pagar una sola vez'),
    redirect_url: z.string().url().optional().describe('URL de retorno tras el pago')
  },
  safe(async (args) => {
    const cop = toCop(args);
    const res = await http(`${WOMPI}/payment_links`, {
      method: 'POST',
      headers: wompiHeaders(),
      body: JSON.stringify({
        name: args.name,
        description: args.description,
        single_use: args.single_use,
        collect_shipping: false,
        currency: 'COP',
        amount_in_cents: cop * 100,
        ...(args.redirect_url ? { redirect_url: args.redirect_url } : {})
      })
    });
    const id = res?.data?.id;
    if (!id) throw new Error(`Wompi no devolvió el id del enlace: ${JSON.stringify(res)}`);
    return {
      link_id: id,
      url: `https://checkout.wompi.co/l/${id}`,
      amount_cop: cop,
      environment: process.env.WOMPI_ENV === 'production' ? 'production' : 'sandbox'
    };
  })
);

server.tool(
  'wompi_get_transaction',
  'Consulta una transacción de Wompi por su ID (status: APPROVED, DECLINED, VOIDED, ERROR o PENDING).',
  { transaction_id: z.string().min(1).describe('ID de la transacción de Wompi') },
  safe(async ({ transaction_id }) => {
    const res = await http(`${WOMPI}/transactions/${encodeURIComponent(transaction_id)}`, { headers: wompiHeaders() });
    const t = res.data || {};
    return {
      transaction_id: t.id,
      status: t.status,
      approved: t.status === 'APPROVED',
      amount_cop: typeof t.amount_in_cents === 'number' ? t.amount_in_cents / 100 : null,
      currency: t.currency,
      payment_method: t.payment_method_type,
      reference: t.reference,
      payment_link_id: t.payment_link_id ?? null
    };
  })
);

await server.connect(new StdioServerTransport());
console.error(`[boltech-payments] listo · strike=${!!process.env.STRIKE_API_KEY} wompi=${!!process.env.WOMPI_PRIVATE_KEY} (${process.env.WOMPI_ENV || 'sandbox'})`);
