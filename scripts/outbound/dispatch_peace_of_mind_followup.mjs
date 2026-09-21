/**
 * =============================================================================
 * SEGUIMIENTO EJECUTIVO B2B TIPO HARVARD (HBS PRINCIPLED CADENCE) — IMPACTO 2
 * =============================================================================
 * Basado en el Modelo de Negociación por Principios de Harvard (Fisher, Ury & Patton)
 * 1. Separar a las personas del problema (Validación del equipo de TI).
 * 2. Focalizarse en intereses, no en posiciones (Paz mental, reputación, checkout).
 * 3. Inventar 3 opciones de mutuo beneficio (A: Libre / B: Flash $19 / C: Agente $69).
 * 4. Insistir en criterios objetivos (RFC 6797, W3C CSP, OWASP 2026).
 * 5. Cierre fiduciario elegante (The Clean Exit / BATNA).
 * 
 * Marca Dual: Destraba AI (LatAm/España) vs. Unblock AI (Global/English).
 * Destino de liquidación: rick2818@strike.me
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import { dispatchUniversalEmail } from '../../lib/universal_email_engine.js';
import { isBlacklisted } from '../../lib/compliance_dnc.js';
import { sendCloudMessage } from '../../lib/telegram_cloud_processor.js';

// Cargar variables de entorno locales de .env si existe
try { process.loadEnvFile?.(); } catch (e) {}

const PIPELINE_FILE = path.resolve('pipeline/leads_contactados_activos.json');

export function isEnglishMarket(country = '') {
  const c = String(country).toLowerCase();
  return c.includes('usa') || c.includes('ee.uu') || c.includes('united states') || 
         c.includes('uk') || c.includes('united kingdom') || c.includes('europe') || 
         c.includes('global') || c.includes('canada') || c.includes('nordic') || 
         c.includes('denmark') || c.includes('sweden') || c.includes('finland');
}

/**
 * Genera el mensaje estructurado bajo el Modelo Harvard de Negociación por Principios
 */
export function buildHarvardMessage({ company, domain, country }) {
  const isEn = isEnglishMarket(country);
  const cleanDomain = domain || '';
  const cleanCompany = company || cleanDomain;

  if (isEn) {
    const videoUrl = `https://unblock-shield.vercel.app/?lang=en&domain=${encodeURIComponent(cleanDomain)}`;
    const flashUrl = `https://unblock-shield.vercel.app/?plan=flash&lang=en&domain=${encodeURIComponent(cleanDomain)}`;
    const subject = `🎯 3 perimeter resolution options for ${cleanCompany} (Harvard Framework & Peace of Mind)`;

    const body = `Dear Executive & Technology Leadership Team at ${cleanCompany},

This is the engineering team at Unblock AI following up on our recent perimeter scan regarding ${cleanDomain}.

Before outlining the technical resolution, we operate under a foundational Harvard negotiation principle:
1. Separate People from the Problem: We fully recognize the demanding roadmaps and core development priorities your engineering team manages daily. The perimeter anomalies identified are not an internal execution issue; they stem from the aggressive 2026 surge in automated edge scans and heightened PCI-DSS v4 / RFC 6797 compliance mandates.

2. Focus on Underlying Interests, Not Positions: Our purpose is not to push meetings or software licenses, but to align directly with your sovereign fiduciary interests:
   • Ensuring your checkout and API endpoints never experience silent drops or integrity breaches.
   • Eliminating edge header injection vectors (XSS, Clickjacking, MIME sniffing).
   • Delivering genuine 24/7 executive peace of mind without adding overhead or fixed headcount.

3. Three Mutual Gain Options (Zero Sales Friction):
To empower your leadership with complete autonomy, we offer three clear resolution paths:

  🔹 OPTION A (Open In-House Resolution / Zero Cost):
     We grant your systems team the exact technical specifications to deploy internally at no charge:
     - Strict Content-Security-Policy (CSP) headers mitigating XSS threats.
     - Strict-Transport-Security (HSTS: max-age=63072000; includeSubDomains; preload).
     - X-Frame-Options: DENY preventing clickjacking vectors.

  🔹 OPTION B (Micro-Risk Flash Patch $19 USD — 60s Remediation):
     If your team prefers immediate turnkey execution, download the forensic report with production-ready configuration patches in a single bundle for $19 USD:
     🔗 ${flashUrl}

  🔹 OPTION C (24/7 Sovereign Sentinel — $2.30 USD/day / $69 USD/mo):
     Delegate continuous automated perimeter monitoring to our fiduciary agent, backed by an Unconditional 7-Day Money-Back Guarantee (if it does not save your team at least 10 hours of manual work in week 1, 100% of your payment is refunded immediately).
     🔗 ${videoUrl}

▶️ WATCH THE 70-SECOND EXECUTIVE VIDEO BRIEFING:
🔗 ${videoUrl}

4. Objective Settlement & The Clean Exit:
Direct zero-fee settlement via Bitcoin Lightning Network: rick2818@strike.me

If your infrastructure has already mitigated these vectors, or if this is outside your priorities for this quarter, we respect your inbox completely: simply reply "Close file" and we will archive this matter immediately with zero further outreach.

Sincerely,
Senior Cyber-Defense & Solutions Team — Unblock AI`;

    return { isEn, subject, body, videoUrl, flashUrl };
  }

  // Idioma Español (Destraba AI)
  const videoUrl = `https://unblock-shield.vercel.app/?domain=${encodeURIComponent(cleanDomain)}`;
  const flashUrl = `https://destraba-ai.vercel.app/?plan=flash&domain=${encodeURIComponent(cleanDomain)}`;
  const subject = `🎯 3 opciones de resolución perimetral para ${cleanCompany} (Diagnóstico Harvard & Paz Mental)`;

  const body = `Estimado equipo directivo y de tecnología en ${cleanCompany},

Le saluda el equipo de ingeniería de Destraba AI. Le escribo en seguimiento a la auditoría perimetral no invasiva que emitimos recientemente sobre ${cleanDomain}.

Antes de cualquier propuesta, deseamos puntualizar un principio fundamental de negociación por principios:
1. Separamos a las personas del problema: Reconocemos el enorme esfuerzo y las prioridades de desarrollo continuo que gestiona su equipo técnico. El desafío que observamos no obedece a deficiencias internas, sino a la rápida evolución de normativas de seguridad (PCI-DSS v4.0 y RFC 6797) y al incremento de escaneos automatizados en la red durante este 2026.

2. Enfoque en sus intereses, no en posiciones: Nuestro objetivo no es insistir en reuniones ni vender software innecesario, sino proteger sus intereses fiduciarios críticos:
   • Blindar la tasa de conversión en sus pasarelas evitando bloqueos o caídas silenciosas.
   • Eliminar riesgos de inyección en cabeceras HTTP (XSS, Clickjacking, MIME sniffing).
   • Proporcionar a la dirección general la auténtica paz mental de operar 24/7 sin sumar costos fijos en nómina.

3. Tres Opciones de Mutuo Beneficio (Sin presiones comerciales):
Para facilitar una resolución eficiente y alineada a sus tiempos, ponemos a su disposición tres caminos objetivos:

  🔹 OPCIÓN A (Autoservicio Libre / Cero Costo):
     Obsequiamos a su departamento de TI las especificaciones técnicas exactas para que las implementen internamente:
     - Cabecera Content-Security-Policy (CSP) estricta contra vectores XSS.
     - Strict-Transport-Security (HSTS: max-age=63072000; includeSubDomains; preload).
     - X-Frame-Options: DENY contra ataques de clickjacking.

  🔹 OPCIÓN B (Micro-Inversión Flash $19 USD — Remediación en 60s):
     Si su equipo prefiere ahorrar tiempo y evitar pruebas manuales, puede descargar el paquete forense con los parches listos para pegar en producción por solo $19 USD:
     🔗 ${flashUrl}

  🔹 OPCIÓN C (Centinela Autónomo 24/7 — $2.30 USD/día / $69 USD/mes):
     Delegue la vigilancia y remediación continua de su infraestructura en nuestro agente fiduciario con Garantía Incondicional de Reembolso a 7 Días (si en una semana no le ahorra 10 horas de trabajo manual a su equipo, devolvemos el 100% de su pago sin preguntas).
     🔗 ${videoUrl}

▶️ VEA EL BRIEFING EJECUTIVO EN VIDEO (70 Segundos):
🔗 ${videoUrl}

4. Criterio Objetivo & Salida Limpia (Harvard Clean Exit):
Liquidación fiduciaria directa e instantánea vía Bitcoin Lightning Network: rick2818@strike.me

Si este asunto ya fue solventado internamente o no forma parte de sus prioridades para este trimestre, respetamos profundamente su tiempo: responda simplemente «Cerrar caso» y archivaremos el expediente de inmediato sin ningún seguimiento posterior.

Atentamente,
Especialista Senior en Automatización y Seguridad Fiduciaria — Destraba AI`;

  return { isEn, subject, body, videoUrl, flashUrl };
}

/**
 * Orquestador principal de despacho Harvard Impacto 2
 */
export async function executeHarvardFollowup(options = {}) {
  const isDryRun = options.dryRun || process.argv.includes('--dry-run');
  const limitArg = process.argv.find(a => a.startsWith('--limit='));
  const batchLimit = options.batchLimit || (limitArg ? parseInt(limitArg.split('=')[1], 10) : 50);

  console.log('=============================================================================');
  console.log('🎓 CADENCIA IMPACTO 2: SEGUIMIENTO EJECUTIVO TIPO HARVARD (HBS PRINCIPLED CADENCE)');
  console.log(`Modo: ${isDryRun ? 'DRY_RUN (Simulación segura)' : 'LIVE (Despacho real en red SMTPS/API)'}`);
  console.log(`Límite del lote: ${batchLimit}`);
  console.log('Destino fiduciario de cobro: rick2818@strike.me');
  console.log('=============================================================================\n');

  if (!fs.existsSync(PIPELINE_FILE)) {
    console.error('[ERROR]: No existe el archivo de pipeline:', PIPELINE_FILE);
    return { sentCount: 0 };
  }

  const pipeline = JSON.parse(fs.readFileSync(PIPELINE_FILE, 'utf8'));

  // Seleccionar leads calificados que recibieron Impacto 1 y no han recibido el Impacto 2 Harvard
  const targetLeads = pipeline.filter(l => {
    const hadImpact1 = l.status === 'ENVIADO_REAL_EN_RED' || 
                       l.status === 'CONTACTADO_IMPACTO_1' || 
                       l.status === 'AUDITADO_Y_LISTO_PARA_NOTIFICACION' ||
                       l.status === 'LISTO_IMPACTO_2';
    const notYetSentImpact2 = l.status !== 'ENVIADO_IMPACTO_2_HARVARD' && 
                              l.status !== 'ENVIADO_IMPACTO_2_PAZ_MENTAL';
    return hadImpact1 && notYetSentImpact2;
  }).slice(0, batchLimit);

  console.log(`Total prospectos calificados para seguimiento Harvard: ${targetLeads.length}`);

  let sentCount = 0;

  for (const lead of targetLeads) {
    const toEmail = lead.corporateEmail || lead.contactEmail || ('contacto@' + lead.domain);
    const domain = lead.domain || '';
    const company = lead.company || domain;

    // Filtro DNC de exclusión obligatoria
    if (await isBlacklisted(toEmail, domain)) {
      console.log(`-> [DNC]: ${toEmail} en lista negra. Omitiendo.`);
      lead.status = 'DNC_EXCLUIDO';
      continue;
    }

    const { isEn, subject, body, videoUrl, flashUrl } = buildHarvardMessage({
      company,
      domain,
      country: lead.country
    });

    console.log(`-----------------------------------------------------------------------------`);
    console.log(`Empresa: ${company} (${domain}) | Idioma: ${isEn ? 'EN' : 'ES'}`);
    console.log(`Destinatario: ${toEmail}`);
    console.log(`Asunto: ${subject}`);

    lead.outboundMessage = { to: toEmail, subject, body };
    lead.targetImpact = 2;
    lead.cadenceModel = 'HARVARD_PRINCIPLED_FOLLOWUP';

    if (isDryRun) {
      console.log('-> [DRY_RUN]: Despacho simulado Harvard Impacto 2 OK.');
      lead.deliveryAudit = {
        dispatchedAt: new Date().toISOString(),
        mode: 'DRY_RUN_SIMULATION',
        impact: 2,
        cadenceType: 'HARVARD_MUTUAL_GAIN_OPTIONS',
        recipient: toEmail,
        status: 'VERIFICADO_LISTO_PARA_TRANSMISION'
      };
      lead.status = 'TRANSMISION_SIMULADA_HARVARD_OK';
      sentCount++;
    } else {
      const formattedHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.65; max-width: 650px;">
          ${body.replace(/\n/g, '<br>')}
        </div>
      `;

      const dispatchResult = await dispatchUniversalEmail({
        to: toEmail,
        subject,
        text: body,
        html: formattedHtml
      });

      if (dispatchResult.success) {
        console.log(`-> [LIVE SUCCESS - HARVARD IMPACTO 2]: ${dispatchResult.transport} | MessageId: ${dispatchResult.messageId}`);
        lead.deliveryAudit = {
          dispatchedAt: new Date().toISOString(),
          mode: 'LIVE',
          impact: 2,
          cadenceType: 'HARVARD_MUTUAL_GAIN_OPTIONS',
          transport: dispatchResult.transport,
          messageId: dispatchResult.messageId,
          recipient: toEmail,
          status: 'TRANSMITIDO_EXITOSO'
        };
        lead.status = 'ENVIADO_IMPACTO_2_HARVARD';
        lead.currentImpact = 2;
        sentCount++;
      } else {
        console.error(`-> [ERROR EN ENVÍO]: ${dispatchResult.error}`);
        lead.deliveryAudit = {
          attemptedAt: new Date().toISOString(),
          mode: 'LIVE_FAILED',
          cadenceType: 'HARVARD_MUTUAL_GAIN_OPTIONS',
          error: dispatchResult.error,
          status: 'REINTENTO_PROGRAMADO'
        };
      }
    }

    // Rate limiting defensivo (2.5 - 4.0 segundos) para protección estricta de reputación IP
    const delayMs = Math.floor(2500 + Math.random() * 1500);
    console.log(`Esperando ${delayMs}ms antes del siguiente envío (Defensa de reputación)...`);
    await new Promise(r => setTimeout(r, delayMs));
  }

  fs.writeFileSync(PIPELINE_FILE, JSON.stringify(pipeline, null, 2), 'utf8');

  console.log('\n=============================================================================');
  console.log('🎓 CADENCIA HARVARD IMPACTO 2 FINALIZADA:');
  console.log(`Total despachados con éxito: ${sentCount} de ${targetLeads.length}`);
  console.log(`Archivo actualizado: ${PIPELINE_FILE}`);
  console.log('=============================================================================\n');

  // Notificación Ejecutiva a Telegram
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_AUTHORIZED_USER_ID || '6311509947';
    if (botToken) {
      const tgMsg = `🎓 <b>CADENCIA HARVARD IMPACTO 2 COMPLETADA</b>\n\n` +
        `📬 <b>Leads Despachados:</b> ${sentCount} de ${targetLeads.length}\n` +
        `⚖️ <b>Estrategia:</b> 3 Opciones de Mutuo Beneficio (A/B/C) + Clean Exit\n` +
        `🎬 <b>Briefing de 70s:</b> Activo y personalizado\n` +
        `🛡️ <b>Destino de Cobro:</b> <code>rick2818@strike.me</code>\n` +
        `🕒 <b>Hora:</b> ${new Date().toISOString()}`;
      await sendCloudMessage(adminChatId, tgMsg, botToken, { isRawHtml: true });
    }
  } catch (err) {
    console.warn('[TELEGRAM WARNING]:', err.message);
  }

  return { sentCount };
}

// Alias de retrocompatibilidad
export const executePeaceOfMindFollowup = executeHarvardFollowup;

if (process.argv[1]?.includes('dispatch_peace_of_mind_followup.mjs')) {
  executeHarvardFollowup().catch(console.error);
}
