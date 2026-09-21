/**
 * =============================================================================
 * CIERRE DE EXPEDIENTE FIDUCIARIO TIPO HARVARD (THE CLEAN EXIT) — IMPACTO 3
 * =============================================================================
 * Basado en la técnica Harvard de "The Positive No" & "The Clean Exit":
 * - Otorga el control absoluto y soberano al decisor ejecutivo.
 * - Desactiva la reactancia psicológica eliminando toda presión comercial.
 * - Solicita permiso explícito para cerrar y archivar el expediente técnico.
 * - Multiplica la tasa de respuesta C-Level al facilitar una respuesta de 1 palabra.
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
import { isEnglishMarket } from './dispatch_peace_of_mind_followup.mjs';

// Cargar variables locales
try { process.loadEnvFile?.(); } catch (e) {}

const PIPELINE_FILE = path.resolve('pipeline/leads_contactados_activos.json');

export function buildHarvardCleanExitMessage({ company, domain, country }) {
  const isEn = isEnglishMarket(country);
  const cleanDomain = domain || '';
  const cleanCompany = company || cleanDomain;

  if (isEn) {
    const subject = `📁 Permission to close perimeter security file for ${cleanDomain || cleanCompany}`;
    const body = `Dear Executive Leadership Team at ${cleanCompany},

I am writing with a brief and direct request: permission to archive your perimeter evaluation file.

We respect your inbox and time above all. We have reached out previously regarding the non-invasive perimeter evaluation on ${cleanDomain} and the three objective resolution options (In-House Open Directives, $19 Flash Patches, or the $2.30/day Autonomous Sentinel).

If this is already resolved internally or simply not an active focus for your leadership team this quarter, we completely understand:
👉 Simply reply with the word "Archive" or "Close", and we will immediately close your case with zero further messages.

However, if you wish to retain sovereign 24/7 protection before we close the record:
🔗 Access the executive briefing or activate instantaneous defense: https://unblock-shield.vercel.app/?lang=en&domain=${encodeURIComponent(cleanDomain)}
⚡ Direct zero-fee Lightning settlement: rick2818@strike.me

We thank you for your time and wish you continued operational success.

Sincerely,
Senior Cyber-Defense & Fiduciary Operations — Unblock AI`;

    return { isEn, subject, body };
  }

  // Español (Destraba AI)
  const subject = `📁 Permiso para archivar expediente de seguridad perimetral de ${cleanDomain || cleanCompany}`;
  const body = `Estimado equipo directivo en ${cleanCompany},

Le escribo con una solicitud muy puntual y respetuosa: permiso para archivar definitivamente el expediente técnico de su portal.

En Destraba AI priorizamos el respeto absoluto a la bandeja de entrada de los directivos. Con anterioridad le compartimos el diagnóstico no invasivo sobre ${cleanDomain} y las 3 alternativas objetivas de resolución (especificaciones abiertas para su equipo interno, parches llave en mano por $19 USD o el centinela autónomo 24/7 por $2.30 USD al día).

Si estos puntos ya fueron subsanados por su equipo de ingeniería o no representan una prioridad para su empresa en este trimestre, lo comprendemos plenamente:
👉 Responda únicamente con la palabra «Archivar» o «Cerrar», y procederemos a dar de baja el expediente sin ninguna insistencia futura.

Si antes del cierre formal desea verificar el diagnóstico o activar el blindaje asistido:
🔗 Portal de verificación y aplicación inmediata: https://destraba-ai.vercel.app/?domain=${encodeURIComponent(cleanDomain)}
⚡ Liquidación instantánea sin comisiones vía Bitcoin Lightning Network: rick2818@strike.me

Agradecemos sinceramente su atención y le deseamos el mayor de los éxitos en sus operaciones.

Atentamente,
Dirección de Operaciones & Automatización Fiduciaria — Destraba AI`;

  return { isEn, subject, body };
}

export async function executeHarvardCleanExit(options = {}) {
  const isDryRun = options.dryRun || process.argv.includes('--dry-run');
  const limitArg = process.argv.find(a => a.startsWith('--limit='));
  const batchLimit = options.batchLimit || (limitArg ? parseInt(limitArg.split('=')[1], 10) : 50);

  console.log('=============================================================================');
  console.log('📁 CADENCIA IMPACTO 3: HARVARD CLEAN EXIT (CIERRE DEFINITIVO DE EXPEDIENTE)');
  console.log(`Modo: ${isDryRun ? 'DRY_RUN (Simulación)' : 'LIVE (Transmisión real en red)'}`);
  console.log(`Límite del lote: ${batchLimit}`);
  console.log('Destino fiduciario: rick2818@strike.me');
  console.log('=============================================================================\n');

  if (!fs.existsSync(PIPELINE_FILE)) {
    console.error('[ERROR]: No existe el archivo de pipeline:', PIPELINE_FILE);
    return { sentCount: 0 };
  }

  const pipeline = JSON.parse(fs.readFileSync(PIPELINE_FILE, 'utf8'));

  // Seleccionar leads que ya recibieron Impacto 2 y requieren cierre limpio
  const targetLeads = pipeline.filter(l => {
    const hadImpact2 = l.status === 'ENVIADO_IMPACTO_2_HARVARD' || 
                       l.status === 'ENVIADO_IMPACTO_2_PAZ_MENTAL' ||
                       l.currentImpact === 2;
    const notYetSentImpact3 = l.status !== 'ENVIADO_IMPACTO_3_CLEAN_EXIT';
    return hadImpact2 && notYetSentImpact3;
  }).slice(0, batchLimit);

  console.log(`Total prospectos calificados para Clean Exit: ${targetLeads.length}`);
  if (targetLeads.length === 0) {
    console.log('No hay prospectos pendientes para Impacto 3 (Clean Exit).');
    return { sentCount: 0 };
  }

  let sentCount = 0;

  for (const lead of targetLeads) {
    const toEmail = lead.corporateEmail || lead.contactEmail || ('contacto@' + lead.domain);
    const domain = lead.domain || '';
    const company = lead.company || domain;

    if (await isBlacklisted(toEmail, domain)) {
      console.log(`-> [DNC]: ${toEmail} en lista de exclusión. Omitiendo.`);
      lead.status = 'DNC_EXCLUIDO';
      continue;
    }

    const { isEn, subject, body } = buildHarvardCleanExitMessage({
      company,
      domain,
      country: lead.country
    });

    console.log(`-----------------------------------------------------------------------------`);
    console.log(`Empresa: ${company} (${domain}) | Idioma: ${isEn ? 'EN' : 'ES'}`);
    console.log(`Destinatario: ${toEmail}`);
    console.log(`Asunto: ${subject}`);

    lead.outboundMessage = { to: toEmail, subject, body };
    lead.targetImpact = 3;

    if (isDryRun) {
      console.log('-> [DRY_RUN]: Despacho simulado Harvard Clean Exit OK.');
      lead.deliveryAudit = {
        dispatchedAt: new Date().toISOString(),
        mode: 'DRY_RUN_SIMULATION',
        impact: 3,
        cadenceType: 'HARVARD_CLEAN_EXIT',
        recipient: toEmail,
        status: 'VERIFICADO_LISTO_PARA_TRANSMISION'
      };
      lead.status = 'TRANSMISION_SIMULADA_CLEAN_EXIT_OK';
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
        console.log(`-> [LIVE SUCCESS - HARVARD CLEAN EXIT]: ${dispatchResult.transport} | MessageId: ${dispatchResult.messageId}`);
        lead.deliveryAudit = {
          dispatchedAt: new Date().toISOString(),
          mode: 'LIVE',
          impact: 3,
          cadenceType: 'HARVARD_CLEAN_EXIT',
          transport: dispatchResult.transport,
          messageId: dispatchResult.messageId,
          recipient: toEmail,
          status: 'TRANSMITIDO_EXITOSO'
        };
        lead.status = 'ENVIADO_IMPACTO_3_CLEAN_EXIT';
        lead.currentImpact = 3;
        sentCount++;
      } else {
        console.error(`-> [ERROR EN ENVÍO]: ${dispatchResult.error}`);
        lead.deliveryAudit = {
          attemptedAt: new Date().toISOString(),
          mode: 'LIVE_FAILED',
          cadenceType: 'HARVARD_CLEAN_EXIT',
          error: dispatchResult.error,
          status: 'REINTENTO_PROGRAMADO'
        };
      }
    }

    const delayMs = Math.floor(2500 + Math.random() * 1500);
    console.log(`Esperando ${delayMs}ms antes del siguiente envío...`);
    await new Promise(r => setTimeout(r, delayMs));
  }

  fs.writeFileSync(PIPELINE_FILE, JSON.stringify(pipeline, null, 2), 'utf8');

  console.log('\n=============================================================================');
  console.log('📁 CADENCIA HARVARD CLEAN EXIT FINALIZADA:');
  console.log(`Total despachados con éxito: ${sentCount} de ${targetLeads.length}`);
  console.log(`Archivo actualizado: ${PIPELINE_FILE}`);
  console.log('=============================================================================\n');

  return { sentCount };
}

if (process.argv[1]?.includes('dispatch_harvard_clean_exit.mjs')) {
  executeHarvardCleanExit().catch(console.error);
}
