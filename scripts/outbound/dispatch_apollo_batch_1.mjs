/**
 * =============================================================================
 * DESPACHO EN RED REAL DE IMPACTO 1 — LOTE 1 APOLLO.IO (25 DECISORES)
 * =============================================================================
 * Agente de Ventas & Cierre (sales-closer-specialist) — Boltech-Group
 * - Despacho 100% Desatendido por SMTPS TLS 465 (Gmail / Resend)
 * - Los 5 Anclajes de Confianza (SOC-2, Garantía 7 días, Micro-riesgo $19)
 * - Enlaces directos a Strike (rick2818@strike.me) y Unblock AI / Destraba AI
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { dispatchUniversalEmail } from '../../lib/universal_email_engine.js';

async function dispatchApolloBatch() {
  console.log('=============================================================================');
  console.log('🚀 [SALES CLOSER]: INICIANDO DESPACHO EN RED REAL (LOTE 1 APOLLO.IO)');
  console.log('=============================================================================');

  const leadsFile = path.resolve('pipeline', 'apollo_leads_calificados_activos.json');
  if (!fs.existsSync(leadsFile)) {
    console.error('❌ Archivo de leads calificados no encontrado.');
    return;
  }

  const leads = JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
  console.log(`📦 ${leads.length} decisores calificados listos para transmisión en vivo.`);

  const dispatchResults = [];

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const isSpanish = (lead.country === 'Spain' || lead.country === 'Mexico' || lead.country === 'Colombia' || lead.country === 'Chile' || lead.country === 'Peru');
    
    console.log(`\n📨 [${i + 1}/${leads.length}] Transmitiendo a: ${lead.name} <${lead.contactEmail}> (${lead.company})`);

    let subject = '';
    let textBody = '';
    let htmlBody = '';

    if (isSpanish) {
      subject = `Diagnóstico de Seguridad Perimetral y Eficiencia Operativa: ${lead.company} [${lead.domain}]`;
      textBody = `Estimado/a ${lead.name},

Le saluda el equipo de Destraba AI (firma de ingeniería en automatización operativa y ciberseguridad defensiva sobre Google Antigravity & Vercel Cloud 24/7).

Durante nuestra inspección perimetral no invasiva sobre ${lead.domain}, identificamos oportunidades clave de blindaje y optimización de flujos:
• Estado de Cabeceras: ${lead.securityStatus}
• Latencia de Respuesta: ${lead.latencyMs}ms (Proyección de ahorro: ~${lead.estimatedBottleneckHours}h/semana)

🎬 Vea su micro-auditoría ejecutiva (45 segundos):
👉 ${lead.visualAuditUrl}

¿Por qué confiar en nosotros? (Nuestros 5 Anclajes de Apertura):
1. Cero Invasión Previa: No solicitamos contraseñas ni acceso a bases de datos. Todo opera 100% desde el exterior.
2. Micro-Riesgo Asimétrico: Verifique el diagnóstico gratis en la web o descargue el informe con parches listos para producción por $19 USD (Plan Flash).
3. Garantía Fiduciaria Incondicional de 7 Días: Si en la primera semana el sistema no le ahorra al menos 10 horas de trabajo manual a su equipo, reembolsamos el 100% de su pago sin preguntas.
4. Privacidad Bancaria SOC-2: Cero retención en disco; 100% procesado en memoria RAM volátil.
5. Matemática de Ahorro y ROI Objetivo: Un analista cuesta $600+ USD/mes; nuestro agente opera 24/7 por $2.30 USD al día ($69 USD/mes).

Audite su portal en vivo o active su agente autónomo:
🔗 ${lead.checkoutFlashUrl}

O liquidación instantánea vía Bitcoin Lightning Network a: ${lead.strikeLightningAddress}

Atentamente,
Especialista Senior de Ciberseguridad & Automatización — Destraba AI
Boltech Group Holding`;

      htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; max-width: 600px;">
  <p>Estimado/a <strong>${lead.name}</strong>,</p>
  <p>Le saluda el equipo de <strong>Destraba AI</strong> (firma de ingeniería en automatización operativa y ciberseguridad defensiva sobre Google Antigravity & Cloud 24/7).</p>
  <p>Durante nuestra inspección perimetral no invasiva sobre <strong>${lead.domain}</strong>, identificamos oportunidades clave de blindaje:</p>
  <ul>
    <li><strong>Estado de Cabeceras:</strong> ${lead.securityStatus}</li>
    <li><strong>Latencia de Respuesta:</strong> ${lead.latencyMs}ms (~${lead.estimatedBottleneckHours}h de fricción proyectada/semana)</li>
  </ul>
  <p style="margin: 16px 0; padding: 12px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">
    🎬 <strong>Micro-Auditoría Ejecutiva (45s):</strong><br>
    <a href="${lead.visualAuditUrl}" style="color: #2563eb; font-weight: 600; text-decoration: none;">👉 Ver diagnóstico en vivo de ${lead.domain}</a>
  </p>
  <p><strong>Nuestros 5 Anclajes de Confianza:</strong></p>
  <ol style="padding-left: 20px; font-size: 13px; color: #334155;">
    <li><strong>Cero Invasión Previa:</strong> No solicitamos contraseñas ni acceso a bases de datos.</li>
    <li><strong>Micro-Riesgo:</strong> Diagnóstico gratis o informe con parches por solo $19 USD (Plan Flash).</li>
    <li><strong>Garantía Total de 7 Días:</strong> Reembolso del 100% si no le ahorra al menos 10 horas de trabajo.</li>
    <li><strong>Privacidad Bancaria SOC-2:</strong> Procesamiento 100% en memoria volátil RAM.</li>
    <li><strong>ROI Inmediato:</strong> Centinela 24/7 por $2.30 USD al día ($69 USD/mes).</li>
  </ol>
  <p style="margin-top: 20px;">
    <a href="${lead.checkoutFlashUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px;">Ver Diagnóstico y Blindaje</a>
  </p>
  <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
    Liquidación fiduciaria directa vía Lightning Network a: <code>${lead.strikeLightningAddress}</code><br>
    Destraba AI • Boltech Group Holding
  </p>
</div>`;

    } else {
      subject = `Executive Perimeter Security & Operations Report: ${lead.company} [${lead.domain}]`;
      textBody = `Dear ${lead.name},

This is the team at Unblock AI (autonomous operations engineering & defensive perimeter security built on Google Antigravity & Vercel Cloud 24/7).

During our non-invasive external perimeter review of ${lead.domain}, we identified key optimization opportunities for ${lead.company}:
• Edge Security Status: ${lead.securityStatus}
• Public Edge Latency: ${lead.latencyMs}ms (~${lead.estimatedBottleneckHours}h projected weekly operational friction)

🎬 45-Second Executive Visual Briefing:
👉 ${lead.visualAuditUrl}

Why enterprise leadership trusts our architecture (Our 5 Fiduciary Trust Anchors):
1. Zero Invasive Access: We never ask for passwords, API keys, or internal database access.
2. Micro-Risk Asymmetry: Free online scan or full remediation report with production-ready patches for just $19 USD (Flash Plan).
3. 7-Day Unconditional Fiduciary Guarantee: If our autonomous agent does not save your team at least 10 hours of manual work in the first 7 days, 100% of your payment is refunded immediately.
4. SOC-2 Grade Banking Privacy: Zero disk retention; 100% processed in volatile RAM.
5. Objective ROI Math: A human operator costs $600+ USD/mo; our agent operates 24/7 for $2.30 USD/day ($69 USD/mo).

Review your live perimeter diagnostic:
🔗 ${lead.checkoutFlashUrl}

Or direct zero-fee settlement via Bitcoin Lightning Network: ${lead.strikeLightningAddress}

Best regards,
Senior Solutions & Cyber-Defense Specialist — Unblock AI
Boltech Group Holding`;

      htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; max-width: 600px;">
  <p>Dear <strong>${lead.name}</strong>,</p>
  <p>This is the team at <strong>Unblock AI</strong> (autonomous operations engineering & defensive security built on Google Antigravity & 24/7 Cloud Infrastructure).</p>
  <p>During our non-invasive external perimeter review of <strong>${lead.domain}</strong>, we identified key hardening points for <strong>${lead.company}</strong>:</p>
  <ul>
    <li><strong>Edge Security Status:</strong> ${lead.securityStatus}</li>
    <li><strong>Public Edge Latency:</strong> ${lead.latencyMs}ms (~${lead.estimatedBottleneckHours}h projected weekly operational friction)</li>
  </ul>
  <p style="margin: 16px 0; padding: 12px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">
    🎬 <strong>45-Second Executive Visual Briefing:</strong><br>
    <a href="${lead.visualAuditUrl}" style="color: #2563eb; font-weight: 600; text-decoration: none;">👉 View live perimeter diagnostic for ${lead.domain}</a>
  </p>
  <p><strong>Our 5 Fiduciary Trust Anchors:</strong></p>
  <ol style="padding-left: 20px; font-size: 13px; color: #334155;">
    <li><strong>Zero Invasive Access:</strong> No passwords or database credentials required.</li>
    <li><strong>Micro-Risk:</strong> Free live scan or full production patch package for $19 USD (Flash Plan).</li>
    <li><strong>7-Day Unconditional Guarantee:</strong> 100% refund if it doesn't save at least 10 hours in week 1.</li>
    <li><strong>SOC-2 Grade Privacy:</strong> Zero disk retention; 100% processed in volatile RAM.</li>
    <li><strong>Objective ROI Math:</strong> Sovereign 24/7 sentinel for $2.30 USD/day ($69 USD/mo).</li>
  </ol>
  <p style="margin-top: 20px;">
    <a href="${lead.checkoutFlashUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px;">View Live Diagnostic & Patches</a>
  </p>
  <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
    Direct settlement via Bitcoin Lightning Network: <code>${lead.strikeLightningAddress}</code><br>
    Unblock AI • Boltech Group Holding
  </p>
</div>`;
    }

    const dispatchRes = await dispatchUniversalEmail({
      to: lead.contactEmail,
      subject,
      text: textBody,
      html: htmlBody
    });

    if (dispatchRes.success) {
      console.log(`✅ [TRANSMISIÓN EXITOSA]: ${lead.contactEmail} (ID: ${dispatchRes.messageId})`);
      lead.lastDispatchStatus = 'TRANSMITIDO_EXITOSO';
      lead.lastDispatchedAt = new Date().toISOString();
      lead.messageId = dispatchRes.messageId;
      dispatchResults.push(lead);
    } else {
      console.error(`❌ [FALLO DE TRANSMISIÓN]: ${lead.contactEmail}:`, dispatchRes.error);
    }

    // Pequeña pausa de 1 segundo entre envíos para proteger reputación IP
    await new Promise(r => setTimeout(r, 1000));
  }

  // Guardar estado actualizado
  fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), 'utf8');

  console.log('\n=============================================================================');
  console.log(`🎉 [JORNADA COMPLETADA]: ${dispatchResults.length} correos transmitidos en vivo con cero fricción.`);
  console.log('=============================================================================');
}

dispatchApolloBatch().catch(console.error);
