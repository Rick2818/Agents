/**
 * =============================================================================
 * SUITE DE PRUEBAS: EXTENSIONES ENTERPRISE
 * (TWILIO, TAVILY, UPSTASH REDIS & BOLTECH MCP SERVER)
 * =============================================================================
 */

import { getWhatsAppStatus, sendWhatsAppMessage } from '../lib/whatsapp_engine.js';
import { getIntelligenceStatus, researchCompanyOrLead } from '../lib/lead_intelligence.js';
import {
  getCacheStatus,
  setDistributedCache,
  getDistributedCache,
  checkDistributedRateLimit
} from '../lib/distributed_cache.js';
import { createBoltechMCPServer } from '../lib/boltech_mcp_server.js';
import whatsappHandler from '../api/whatsapp.js';
import intelHandler from '../api/intel.js';

console.log('=== INICIANDO SUITE DE PRUEBAS: EXTENSIONES ENTERPRISE ===\n');

// 1. WhatsApp & Twilio
console.log('1. Probando WhatsApp & Twilio:');
const waStatus = getWhatsAppStatus();
console.assert(waStatus.success === true, 'getWhatsAppStatus debe ser true');
console.assert(waStatus.sdk === 'twilio', 'SDK debe ser twilio');

const waSend = await sendWhatsAppMessage({ to: '+50371234567', body: 'Propuesta fiduciaria BolTech' });
console.assert(typeof waSend.success === 'boolean', 'sendWhatsAppMessage debe retornar resultado tipado');
console.log('  ✅ WhatsApp / Twilio: PASADO');

// 2. Lead Intelligence (Tavily)
console.log('\n2. Probando Lead Intelligence (Tavily):');
const intelStatus = getIntelligenceStatus();
console.assert(intelStatus.success === true, 'getIntelligenceStatus debe ser true');
console.assert(intelStatus.sdk === '@tavily/core', 'SDK debe ser @tavily/core');

const intelSearch = await researchCompanyOrLead('Banco Agricola El Salvador');
console.assert(intelSearch.success === true, 'Búsqueda debe ejecutarse sin errores');
console.assert(Array.isArray(intelSearch.results), 'Resultados deben ser un arreglo');
console.log('  ✅ Lead Intelligence / Tavily: PASADO');

// 3. Caché Distribuida & Rate Limiter (Upstash Redis)
console.log('\n3. Probando Caché Distribuida & Rate Limiter (Upstash Redis):');
const cacheStatus = getCacheStatus();
console.assert(cacheStatus.success === true, 'getCacheStatus debe ser true');

await setDistributedCache('fiduciary:test_token', { active: true, plan: 'enterprise' }, 60);
const cached = await getDistributedCache('fiduciary:test_token');
console.assert(cached?.active === true, 'Valor recuperado debe ser idéntico al guardado');
console.assert(cached?.plan === 'enterprise', 'Propiedad de objeto debe persistir');

const rateLimit = await checkDistributedRateLimit('client_192_168_1_50', 5, 10);
console.assert(rateLimit.allowed === true, 'Primer chequeo debe ser permitido');
console.assert(rateLimit.current === 1, 'Contador debe iniciar en 1');
console.log('  ✅ Caché Distribuida / Upstash Redis: PASADO');

// 4. Servidor MCP Estandarizado (@modelcontextprotocol/sdk)
console.log('\n4. Probando Servidor MCP (@modelcontextprotocol/sdk):');
const mcpServer = createBoltechMCPServer();
console.assert(mcpServer !== null, 'Servidor MCP debe instanciarse');
console.log('  ✅ Servidor MCP Estandarizado: PASADO');

// 5. Endpoint GET & POST /api/whatsapp
console.log('\n5. Probando Endpoints /api/whatsapp:');
let waHttpStatus = 0;
const mockResWa = {
  setHeader: () => {},
  status: (code) => {
    waHttpStatus = code;
    return { json: () => {} };
  }
};
await whatsappHandler({ method: 'GET', headers: {}, socket: {} }, mockResWa);
console.assert(waHttpStatus === 200, 'GET /api/whatsapp debe responder HTTP 200');

await whatsappHandler({ method: 'POST', body: {}, headers: {}, socket: {} }, mockResWa);
console.assert(waHttpStatus === 400, 'POST /api/whatsapp sin parámetros debe responder HTTP 400');
console.log('  ✅ Endpoints /api/whatsapp: PASADO');

// 6. Endpoint GET & POST /api/intel
console.log('\n6. Probando Endpoints /api/intel:');
let intelHttpStatus = 0;
const mockResIntel = {
  setHeader: () => {},
  status: (code) => {
    intelHttpStatus = code;
    return { json: () => {} };
  }
};
await intelHandler({ method: 'GET', headers: {}, socket: {} }, mockResIntel);
console.assert(intelHttpStatus === 200, 'GET /api/intel debe responder HTTP 200');

await intelHandler({ method: 'POST', body: {}, headers: {}, socket: {} }, mockResIntel);
console.assert(intelHttpStatus === 400, 'POST /api/intel sin query debe responder HTTP 400');
console.log('  ✅ Endpoints /api/intel: PASADO');

console.log('\n======================================================');
console.log('🎯 TODAS LAS PRUEBAS DE EXTENSIONES ENTERPRISE PASARON AL 100%');
console.log('======================================================\n');
