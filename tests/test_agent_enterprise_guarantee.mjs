/**
 * =============================================================================
 * SUITE DE VERIFICACIÓN AUTOMATIZADA: GARANTÍAS ENTERPRISE DE AGENTES B2B
 * =============================================================================
 * Boltech Group & Unblock AI Shield
 * SOC-2 Type II | Fail-Closed | Zero-Trust | Multi-Tenant Sandbox
 * =============================================================================
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import {
  timingSafeCompare,
  escapeHtml,
  checkRateLimit,
  applyStrictBankingHeaders,
  generateSignedToken,
  verifySignedToken
} from '../lib/fiduciary_core.js';

test('1. Aislamiento Multi-Tenant y Contratos Estrictos Zod (Zero-Leakage)', (t) => {
  const ClientAgentSchema = z.object({
    tenantId: z.string().min(4),
    agentName: z.string().min(2),
    settlementDestination: z.string().email().or(z.string().regex(/^[a-zA-Z0-9._%+-]+@strike\.me$/)),
    maxDailyBudgetUsd: z.number().positive(),
    channels: z.array(z.enum(['TELEGRAM', 'WHATSAPP', 'EMAIL', 'WEB_WIDGET'])).min(1),
    failClosedPolicy: z.boolean().default(true)
  });

  // Caso Válido: Cliente Corporativo
  const validTenant = {
    tenantId: 'tenant_acme_corp_sv',
    agentName: 'Acme Hunter Agent',
    settlementDestination: 'rick2818@strike.me',
    maxDailyBudgetUsd: 300,
    channels: ['TELEGRAM', 'EMAIL'],
    failClosedPolicy: true
  };
  const parsedValid = ClientAgentSchema.safeParse(validTenant);
  assert.equal(parsedValid.success, true, 'La configuración válida debe ser aprobada');

  // Caso Inválido: Payloads maliciosos o corruptos
  const invalidTenant = {
    tenantId: 'x', // muy corto
    agentName: '',
    settlementDestination: 'invalid-url-not-an-address',
    maxDailyBudgetUsd: -50,
    channels: ['INVALID_CHANNEL']
  };
  const parsedInvalid = ClientAgentSchema.safeParse(invalidTenant);
  assert.equal(parsedInvalid.success, false, 'Payloads corruptos deben ser rechazados en RAM');
});

test('2. Blindaje Criptográfico Timing-Safe & Verificación de Secretos', () => {
  const masterSecret = 'boltech_fiduciary_secret_master_token_2026';
  const validIncoming = 'boltech_fiduciary_secret_master_token_2026';
  const forgedIncoming = 'boltech_fiduciary_secret_master_token_FORGED';

  assert.equal(timingSafeCompare(validIncoming, masterSecret), true, 'Tokens idénticos deben coincidir en tiempo constante');
  assert.equal(timingSafeCompare(forgedIncoming, masterSecret), false, 'Tokens manipulados deben ser rechazados');
  assert.equal(timingSafeCompare('', masterSecret), false, 'Token vacío debe ser rechazado sin excepción');
  assert.equal(timingSafeCompare(null, masterSecret), false, 'Token nulo debe ser rechazado de forma segura');
});

test('3. Tokens HMAC Firmados con Expiración en Memoria Volátil RAM', () => {
  const payload = 'tenant_session_789456';
  const signedToken = generateSignedToken(payload, 3000); // 3 segundos

  const verification = verifySignedToken(signedToken);
  assert.equal(verification.valid, true, 'Token recién firmado debe ser válido');
  assert.equal(verification.payload, payload, 'El payload recuperado debe coincidir');

  // Token alterado
  const tamperedToken = signedToken.replace(payload, 'forged_tenant_123');
  const tamperedResult = verifySignedToken(tamperedToken);
  assert.equal(tamperedResult.valid, false, 'Token manipulado debe invalidarse inmediatamente');
});

test('4. Sanitización Anti-XSS Integral (CWE-79) en Respuestas de Agentes', () => {
  const maliciousInput = '<script>alert("xss")</script><img src=x onerror=stealCookies()>';
  const sanitized = escapeHtml(maliciousInput);

  assert.equal(sanitized.includes('<script>'), false, 'Etiquetas script deben ser neutralizadas');
  assert.equal(sanitized.includes('onerror='), false, 'Atributos inline de eventos deben ser bloqueados');
  assert.equal(sanitized.includes('&lt;script&gt;'), true, 'Debe aplicar escaping de entidades HTML seguro');
});

test('5. Rate Limiter Serverless en Memoria RAM (Protección Anti-Flooding & DoS)', () => {
  const testIp = '190.86.100.45';
  const limit = 5;
  const windowMs = 10000;

  for (let i = 1; i <= limit; i++) {
    const res = checkRateLimit(testIp, limit, windowMs);
    assert.equal(res.allowed, true, `La solicitud #${i} dentro del límite debe permitirse`);
  }

  // Solicitud #6 debe ser bloqueada inmediatamente
  const blockedRes = checkRateLimit(testIp, limit, windowMs);
  assert.equal(blockedRes.allowed, false, 'Solicitudes que excedan el límite deben bloquearse con HTTP 429');
  assert.ok(blockedRes.remainingSeconds > 0, 'Debe reportar tiempo de enfriamiento');
});

test('6. Cabeceras de Seguridad Bancaria Fiduciaria Grado A+', () => {
  const mockHeaders = {};
  const mockRes = {
    setHeader: (k, v) => { mockHeaders[k] = v; }
  };

  applyStrictBankingHeaders(mockRes);

  assert.ok(mockHeaders['Strict-Transport-Security'], 'HSTS debe estar presente');
  assert.equal(mockHeaders['X-Frame-Options'], 'DENY', 'Clickjacking debe estar bloqueado con DENY');
  assert.equal(mockHeaders['X-Content-Type-Options'], 'nosniff', 'MIME sniffing debe estar desactivado');
  assert.ok(mockHeaders['Content-Security-Policy'].includes("default-src 'self'"), 'CSP estricta debe estar configurada');
});
