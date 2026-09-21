/**
 * =============================================================================
 * CONECTOR & RADAR SEMÁNTICO EXPLEE AI PARA UNBLOCK AI SHIELD
 * =============================================================================
 * Integra el servidor MCP / API de Explee AI (digitaldrreamer/explee-mcp) con
 * el motor de auditoría perimetral y prospección autónoma de Unblock AI Shield.
 * 
 * Flujo:
 * 1. Consulta semántica de prospectos según ICP en Explee AI.
 * 2. Enriquecimiento de dominios y correos directivos (C-Level / CISO / IT).
 * 3. Filtrado obligatorio por el Escáner Defensivo de Unblock AI Shield
 *    (Solo ingresan prospectos con brechas reales comprobadas en CSP/HSTS/X-Frame).
 * 4. Incorporación inmediata al pipeline fiduciario con liquidación a rick2818@strike.me.
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

// Cargar .env
try { process.loadEnvFile?.(); } catch (e) {}

const EXPLEE_API_URL = process.env.EXPLEE_API_URL || 'https://api.explee.com/v1';
const EXPLEE_MCP_URL = process.env.EXPLEE_MCP_URL || 'https://explee.drreamer.digital/mcp';
const EXPLEE_API_KEY = process.env.EXPLEE_API_KEY || '';

/**
 * Verifica si la clave de Explee AI está configurada
 */
export function isExpleeConfigured() {
  return Boolean(EXPLEE_API_KEY && EXPLEE_API_KEY.trim().length > 10);
}

/**
 * Escáner perimetral defensivo no invasivo (Unblock AI Shield)
 */
export function auditDomainPerimeter(hostname) {
  return new Promise((resolve) => {
    const cleanHost = hostname.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const req = https.request({
      hostname: cleanHost,
      method: 'GET',
      path: '/',
      timeout: 6000,
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Unblock-AI-Shield-Radar/3.0'
      }
    }, (res) => {
      const h = res.headers;
      const flaws = [];
      if (!h['content-security-policy']) flaws.push("Falta Content-Security-Policy (Riesgo Inyección XSS)");
      if (!h['strict-transport-security']) flaws.push("Falta Strict-Transport-Security (Riesgo SSL Strip)");
      if (!h['x-frame-options']) flaws.push("Falta X-Frame-Options (Riesgo Clickjacking)");

      resolve({
        reachable: true,
        statusCode: res.statusCode,
        flawsCount: flaws.length,
        flaws,
        server: h['server'] || 'Cloud Edge',
        hasBreach: flaws.length > 0
      });
    });

    req.on('error', (e) => resolve({ reachable: false, error: e.message, hasBreach: false }));
    req.on('timeout', () => { req.destroy(); resolve({ reachable: false, error: 'TIMEOUT', hasBreach: false }); });
    req.end();
  });
}

/**
 * Búsqueda de prospectos en Explee AI mediante consulta semántica
 */
export async function searchProspectsExplee(query, options = {}) {
  if (!isExpleeConfigured()) {
    console.warn('[EXPLEE AI]: EXPLEE_API_KEY no configurada en .env. Retornando modo contingencia/catálogo validado.');
    return {
      success: false,
      reason: 'EXPLEE_API_KEY_REQUIRED',
      instruction: 'Regístrate en explee.com para obtener tus $30 USD en créditos de bienvenida e ingresa EXPLEE_API_KEY en tu .env'
    };
  }

  try {
    const response = await fetch(`${EXPLEE_API_URL}/companies/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EXPLEE_API_KEY}`,
        'X-API-Key': EXPLEE_API_KEY
      },
      body: JSON.stringify({
        prompt: query,
        limit: options.limit || 25,
        filters: options.filters || {}
      })
    });

    if (!response.ok) {
      throw new Error(`Explee API Error HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, companies: data.companies || [] };
  } catch (err) {
    console.error('[EXPLEE AI API ERROR]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Pipeline Integrado: Toma una lista de prospectos descubiertos por Explee,
 * los audita con Unblock AI Shield y guarda solo los que tienen brechas confirmadas.
 */
export async function ingestAndFilterExpleeLeads(leads) {
  console.log(`[UNBLOCK AI SHIELD RADAR]: Evaluando ${leads.length} prospectos descubiertos...`);
  const qualifiedLeads = [];

  for (const lead of leads) {
    if (!lead.domain) continue;
    const audit = await auditDomainPerimeter(lead.domain);

    if (audit.reachable && audit.hasBreach) {
      console.log(`✅ [BRECHA VERIFICADA]: ${lead.domain} (${audit.flawsCount} fallas: ${audit.flaws.join(', ')})`);
      qualifiedLeads.push({
        company: lead.company || lead.name,
        domain: lead.domain,
        country: lead.country || 'LatAm / Global',
        contactEmail: lead.contactEmail || lead.email || `contacto@${lead.domain}`,
        flawsCount: audit.flawsCount,
        flaws: audit.flaws,
        statusCode: audit.statusCode,
        source: 'EXPLEE_AI_RADAR',
        status: 'PYME_CALIFICADA_LISTA',
        offer: '$19 USD Flash / $69 USD Pro',
        strikePaymentDestination: 'rick2818@strike.me',
        checkoutUrl: `https://unblock-shield.vercel.app/?domain=${lead.domain}`
      });
    } else {
      console.log(`❌ [SIN BRECHAS / DESCARTADO]: ${lead.domain}`);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`[UNBLOCK AI SHIELD RADAR]: ${qualifiedLeads.length} de ${leads.length} calificados fiduciariamente.`);
  return qualifiedLeads;
}

if (process.argv[1]?.includes('explee_connector.mjs')) {
  console.log('--- TEST CONECTOR EXPLEE AI / UNBLOCK AI SHIELD ---');
  console.log('Clave Explee configurada:', isExpleeConfigured());
  console.log('Probando auditoría perimetral sobre alkosto.com...');
  auditDomainPerimeter('alkosto.com').then((res) => {
    console.log('Resultado auditoría:', res);
  });
}
