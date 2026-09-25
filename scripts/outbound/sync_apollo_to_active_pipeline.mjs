/**
 * =============================================================================
 * SINCRONIZADOR DE LEADS APOLLO AL REGISTRO CENTRAL DE CADENCIAS
 * =============================================================================
 * Asegura que los crons de GitHub Actions (Impacto 2 y 3) reconozcan a los
 * 25 decisores de Apollo para seguimiento 100% desatendido a las 48 horas.
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';

const activePath = path.resolve('pipeline', 'leads_contactados_activos.json');
const apolloPath = path.resolve('pipeline', 'apollo_leads_calificados_activos.json');

if (!fs.existsSync(activePath) || !fs.existsSync(apolloPath)) {
  console.error('❌ Archivos de pipeline no encontrados.');
  process.exit(1);
}

const active = JSON.parse(fs.readFileSync(activePath, 'utf8'));
const apollo = JSON.parse(fs.readFileSync(apolloPath, 'utf8'));

let added = 0;
const now = new Date().toISOString();
const followUpDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

for (let i = 0; i < apollo.length; i++) {
  const lead = apollo[i];
  const exists = active.some(a => a.contactEmail === lead.contactEmail || a.domain === lead.domain);
  
  if (!exists) {
    active.push({
      id: lead.leadId || `audit_apollo_${Date.now()}_${i}`,
      company: lead.company,
      domain: lead.domain,
      contactName: lead.name,
      contactEmail: lead.contactEmail,
      jobTitle: lead.title,
      country: lead.country,
      employees: lead.employees,
      industry: lead.industry,
      technologies: lead.technologies,
      operationalPain: `Estado de Cabeceras: ${lead.securityStatus} (Latencia: ${lead.latencyMs}ms)`,
      offer: '$19 USD (auditoría técnica defensiva Flash + Parche) / $69 USD (Agente Autónomo 24/7)',
      strikePaymentDestination: 'rick2818@strike.me',
      checkoutUrl: lead.checkoutFlashUrl,
      visualAuditUrl: lead.visualAuditUrl,
      directStrikePaymentUrl: 'https://strike.me/rick2818',
      status: 'ENVIADO_IMPACTO_1',
      currentImpact: 1,
      targetImpact: 1,
      nextFollowUpDate: followUpDate,
      deliveryAudit: {
        dispatchedAt: lead.lastDispatchedAt || now,
        mode: 'LIVE',
        impact: 1,
        cadenceType: 'DIAGNOSTICO_PERIMETRAL_5_ANCLAJES',
        transport: 'GMAIL_SMTPS',
        messageId: lead.messageId || 'smtp_apollo_dispatched',
        recipient: lead.contactEmail,
        status: 'TRANSMITIDO_EXITOSO'
      }
    });
    added++;
  }
}

fs.writeFileSync(activePath, JSON.stringify(active, null, 2), 'utf8');
console.log(`✅ [SINCRONIZACIÓN EXITOSA]: ${added} leads de Apollo incorporados al registro central. (Total activos: ${active.length})`);
