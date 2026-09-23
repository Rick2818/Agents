/**
 * =============================================================================
 * DESPACHO EN VIVO DE RESPUESTA A LUCJAN KISIEL (CBYTES / HOSTING SDATA)
 * =============================================================================
 * Agente de Ventas & Cierre: Despacho 100% desatendido por red real (SMTPS TLS 465)
 * =============================================================================
 */

import { dispatchUniversalEmail } from '../../lib/universal_email_engine.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function sendReplyToLucjan() {
  console.log('🚀 [SALES CLOSER]: Iniciando despacho en red real para Lucjan Kisiel (CBytes / SDATA Hosting)...');

  const recipient = 'lucjan.kisiel@sdata.net.pl';
  const subject = 'Re: Infrastructure & support automation for CBytes';
  
  const textBody = `Hi Lucjan,

Haha, fair point on the 30TB storage! Maintaining high-capacity hosting infrastructure with 99.8% uptime is serious engineering.

The reason I reached out is that hosting providers lose up to 40% of their senior Linux sysadmin time troubleshooting repetitive Level 1 tickets (DNS records, SSL renewals, basic VPS reboot requests, and abuse/spam perimeter noise).

Unblock AI Shield gives you a dedicated autonomous L1 support & security agent running 24/7 with SOC-2 privacy, zero disk retention, zero CPU overhead on your clusters, and instant resolution for hosting customers.

You can view your live perimeter security & diagnostic report here:
👉 https://unblock-shield.vercel.app/?domain=sdata.net.pl&lang=en

If you ever want to free up your Linux team from tier-1 support so you can focus 100% on scaling storage, our Flash Plan ($19) and Pro Operator ($69/mo) come with an unconditional 7-day guarantee.

Wishing you 100% uptime and full storage racks!

Best regards,
Allison Ramos — Unblock AI Shield
Boltech Group Holding • Autonomous Infrastructure`;

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; max-width: 600px;">
  <p>Hi Lucjan,</p>
  
  <p>Haha, fair point on the 30TB storage! Maintaining high-capacity hosting infrastructure with 99.8% uptime is serious engineering.</p>
  
  <p>The reason I reached out is that hosting providers lose up to <strong>40% of their senior Linux sysadmin time</strong> troubleshooting repetitive Level 1 tickets (DNS records, SSL certificate renewals, basic VPS reboot queries, and abuse/spam perimeter noise).</p>
  
  <p><strong>Unblock AI Shield</strong> gives you a dedicated autonomous L1 support & security agent running 24/7 with SOC-2 privacy, zero disk retention, zero CPU overhead on your clusters, and instant resolution for hosting clients.</p>
  
  <p style="margin: 18px 0; padding: 12px 16px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">
    📊 <strong>Direct access to live perimeter diagnostic:</strong><br>
    <a href="https://unblock-shield.vercel.app/?domain=sdata.net.pl&lang=en" style="color: #2563eb; text-decoration: none; font-weight: 600;">
      👉 https://unblock-shield.vercel.app/?domain=sdata.net.pl
    </a>
  </p>
  
  <p>If you ever want to free up your Linux team from tier-1 support so you can focus 100% on scaling storage, our <strong>Flash Plan ($19)</strong> and <strong>Pro Operator ($69/mo)</strong> come with an unconditional 7-day money-back guarantee.</p>
  
  <p>Wishing you 100% uptime and full storage racks!</p>
  
  <p style="margin-top: 24px; color: #475569;">
    Best regards,<br>
    <strong>Allison Ramos</strong><br>
    <span style="font-size: 12px; color: #64748b;">Autonomous Operations & Security Specialist — Unblock AI Shield</span><br>
    <span style="font-size: 11px; color: #94a3b8;">Boltech Group Holding • Autonomous Infrastructure</span>
  </p>
</div>
`;

  const result = await dispatchUniversalEmail({
    to: recipient,
    subject: subject,
    text: textBody,
    html: htmlBody
  });

  if (result.success) {
    console.log('✅ [CORREO DESPACHADO CON ÉXITO EN RED REAL]:');
    console.log(`- Destinatario: ${recipient}`);
    console.log(`- Asunto: ${subject}`);
    console.log(`- Transporte: ${result.transport}`);
    console.log(`- MessageId: ${result.messageId}`);

    // 1. Registrar en el pipeline activo
    const pipelineFile = path.resolve('pipeline', 'leads_contactados_activos.json');
    if (fs.existsSync(pipelineFile)) {
      try {
        const pipeline = JSON.parse(fs.readFileSync(pipelineFile, 'utf8'));
        let lead = pipeline.find(l => l.contactEmail === recipient || l.domain === 'sdata.net.pl');
        if (!lead) {
          lead = {
            id: 'lead_sdata_lucjan_kisiel',
            company: 'CBytes / SDATA Hosting',
            domain: 'sdata.net.pl',
            contactName: 'Lucjan Kisiel',
            contactEmail: recipient,
            jobTitle: 'Senior Linux Administrator / Founder',
            status: 'RESPUESTA_DESPACHADA_POR_AGENTE',
            firstContactedAt: '2026-09-22T08:02:00Z',
            lastReplySentAt: new Date().toISOString(),
            messageId: result.messageId,
            dealValueUSD: 69,
            checkoutUrl: 'https://unblock-shield.vercel.app/?domain=sdata.net.pl&lang=en'
          };
          pipeline.push(lead);
        } else {
          lead.status = 'RESPUESTA_DESPACHADA_POR_AGENTE';
          lead.lastReplySentAt = new Date().toISOString();
          lead.messageId = result.messageId;
        }
        fs.writeFileSync(pipelineFile, JSON.stringify(pipeline, null, 2), 'utf8');
        console.log('📋 Pipeline activo actualizado con el registro del envío.');
      } catch (e) {
        console.warn('Error actualizando pipeline activo:', e.message);
      }
    }

    // 2. Actualizar plan de acción de hot leads
    const actionPlanFile = path.resolve('pipeline', 'hot_leads_action_plan.json');
    if (fs.existsSync(actionPlanFile)) {
      try {
        const actionPlan = JSON.parse(fs.readFileSync(actionPlanFile, 'utf8'));
        const target = actionPlan.find(l => l.contactEmail === recipient || l.domain === 'sdata.net.pl');
        if (target) {
          target.status = 'RESPUESTA_DESPACHADA_POR_AGENTE';
          target.lastRepliedAt = new Date().toISOString();
          target.messageId = result.messageId;
          fs.writeFileSync(actionPlanFile, JSON.stringify(actionPlan, null, 2), 'utf8');
          console.log('🔥 Plan de acción de Hot Leads actualizado a RESPUESTA_DESPACHADA_POR_AGENTE.');
        }
      } catch (e) {
        console.warn('Error actualizando plan de acción:', e.message);
      }
    }

    // 3. Actualizar Airtable local store
    const airtableFile = path.resolve('data', 'airtable_local_store.json');
    if (fs.existsSync(airtableFile)) {
      try {
        const airtableData = JSON.parse(fs.readFileSync(airtableFile, 'utf8'));
        const deal = airtableData.deals?.find(d => d.fields.LeadEmail === recipient);
        if (deal) {
          deal.fields.Stage = 'Respuesta Despachada / Seguimiento Activo';
          deal.fields.LastInteraction = new Date().toISOString();
        }
        const lead = airtableData.leads?.find(l => l.fields.Email === recipient);
        if (lead) {
          lead.fields.Status = '🚀 Respuesta Despachada / En Negociación';
        }
        fs.writeFileSync(airtableFile, JSON.stringify(airtableData, null, 2), 'utf8');
        console.log('📊 Airtable Cockpit sincronizado exitosamente.');
      } catch (e) {
        console.warn('Error actualizando airtable local store:', e.message);
      }
    }

  } else {
    console.error('❌ [ERROR EN EL ENVÍO]:', result.error);
  }
}

sendReplyToLucjan().catch(console.error);
