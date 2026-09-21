/**
 * =============================================================================
 * IMPORTADOR DE LEADS VERIFICADOS A EXPLEE AUTOGTM
 * =============================================================================
 * Importa los 41 prospectos con vulnerabilidades perimetrales confirmadas
 * (CSP, HSTS, X-Frame-Options faltantes) a la infraestructura AutoGTM de Explee AI.
 *
 * Utiliza dominios pre-calentados (pre-warmed) para enviar con reputación óptima
 * y cero riesgo de sandbox o daño al dominio principal.
 *
 * Proyecto: ID 38828 (unblock-shield.vercel.app)
 * Destino de cobro: rick2818@strike.me ($19 USD Flash / $69 USD Pro)
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const EXPLEE_API_KEY = process.env.EXPLEE_API_KEY;
const EXPLEE_BASE_URL = 'https://api.explee.com/public/api/v1';
const PROJECT_ID = 38828;

if (!EXPLEE_API_KEY) {
  console.error('❌ ERROR: EXPLEE_API_KEY no encontrada en .env');
  process.exit(1);
}

const verifiedLeadsPath = path.resolve('pipeline', 'leads_explee_ai_verificados.json');
if (!fs.existsSync(verifiedLeadsPath)) {
  console.error(`❌ ERROR: No se encontró el archivo ${verifiedLeadsPath}`);
  process.exit(1);
}

const rawLeads = JSON.parse(fs.readFileSync(verifiedLeadsPath, 'utf8'));
console.log(`📡 [EXPLEE AUTOGTM IMPORT]: Cargando ${rawLeads.length} prospectos verificados con brechas...`);

/**
 * Mapea cada lead a los campos requeridos por Explee AutoGTM:
 * email, first_name, last_name, company_domain, job_title, company_name
 */
function mapLeadToExpleeFormat(lead) {
  const email = lead.contactEmail;
  const localPart = email.split('@')[0].toLowerCase();
  
  let firstName = 'Director';
  let lastName = 'of Operations';
  let jobTitle = 'Technical Operations Lead';

  if (localPart.includes('data.protection') || localPart.includes('dpo')) {
    firstName = 'Data Protection';
    lastName = 'Officer';
    jobTitle = 'Data Protection Officer (DPO)';
  } else if (localPart.includes('lopd') || localPart.includes('lgpd') || localPart.includes('privacidad') || localPart.includes('compliance')) {
    firstName = 'Privacy & Compliance';
    lastName = 'Director';
    jobTitle = 'Head of Compliance & Data Privacy';
  } else if (localPart.includes('dns') || localPart.includes('opensource') || localPart.includes('admin') || localPart.includes('webmaster')) {
    firstName = 'Infrastructure';
    lastName = 'Lead';
    jobTitle = 'Head of Infrastructure & Cloud Security';
  } else if (localPart.includes('.')) {
    const parts = localPart.split('.').filter(p => p.length > 1);
    if (parts.length >= 2) {
      firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      jobTitle = 'Technology & Operations Lead';
    } else if (parts.length === 1) {
      firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      lastName = 'Director';
      jobTitle = 'Technology Director';
    }
  } else if (localPart.includes('media') || localPart.includes('pr') || localPart.includes('corporate')) {
    firstName = 'Corporate Affairs';
    lastName = 'Director';
    jobTitle = 'Corporate Affairs & Brand Protection';
  } else {
    firstName = 'Executive';
    lastName = 'Director';
    jobTitle = 'E-Commerce & Technology Director';
  }

  return {
    email: lead.contactEmail,
    first_name: firstName,
    last_name: lastName,
    company_domain: lead.domain,
    company_name: lead.company,
    job_title: jobTitle
  };
}

const preparedLeads = rawLeads.map(mapLeadToExpleeFormat);

const importPayload = {
  project_id: PROJECT_ID,
  name: `Unblock AI Shield - 41 Verified Security Perimeter Breaches (${new Date().toISOString().slice(0, 10)})`,
  instructions: `Target audience: Technical directors, Data Protection Officers, and Operations Leads.
Brand: Unblock AI Shield (https://unblock-shield.vercel.app).
Offer: Automated perimeter security audit and zero-friction compliance patching.
Pain: Recent non-invasive cloud perimeter scan detected that their domain is missing critical defense-in-depth headers (Content-Security-Policy, HSTS, and X-Frame-Options), leaving them exposed to XSS, clickjacking, and SSL stripping vulnerabilities.
Mandatory 5 Trust Anchors:
1. Zero invasion: 100% cloud-based non-invasive scan. We never ask for passwords, internal database access, or server credentials.
2. SOC-2 / Bank-grade privacy: 100% in-memory RAM processing, zero disk retention. No customer data is ever stored or used for AI training.
3. Micro-risk entry: Live 15-second audit report or complete production-ready security patch bundle for just $19 USD (Flash Plan).
4. 7-Day Unconditional Guarantee: Full 100% refund if it doesn't save at least 10 hours of manual security engineering.
5. Instant ROI: An external security consultant or manual pentest costs $600-$3,000+ USD; Unblock AI Shield provides automated protection starting at $19 USD.
Call to Action: Visit their pre-configured audit at https://unblock-shield.vercel.app/?domain={company_domain} or reply directly to request the ready-to-deploy patch bundle.`,
  followup_instructions: `Follow-up brief:
Reiterate the risk of unpatched perimeter vulnerabilities (compliance fines under GDPR/LGPD/PCI-DSS and vulnerability to clickjacking/XSS).
Remind them of the 7-day unconditional guarantee and the $19 USD Flash patch available instantly via Strike Lightning / Card.
Provide a clear, low-friction reply path: 'Would you like us to send over the ready-to-deploy Nginx/Cloudflare security header configuration for your domain?'`,
  language: 'auto',
  leads: preparedLeads
};

async function runImport() {
  console.log(`🚀 [EXPLEE AUTOGTM IMPORT]: Despachando importación hacia ${EXPLEE_BASE_URL}/autogtm/campaigns/import...`);
  console.log(`📦 Proyecto: ${PROJECT_ID} | Campaña: "${importPayload.name}" | Total prospectos: ${importPayload.leads.length}`);

  try {
    const res = await fetch(`${EXPLEE_BASE_URL}/autogtm/campaigns/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': EXPLEE_API_KEY
      },
      body: JSON.stringify(importPayload)
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`HTTP ${res.status}: ${errBody}`);
    }

    const { task_id } = await res.json();
    console.log(`✅ [TAREA ACEPTADA]: task_id = ${task_id}`);
    console.log('⏳ Sondeando estado de la tarea en Explee...');

    let completed = false;
    let attempts = 0;
    let finalResult = null;

    while (!completed && attempts < 30) {
      attempts++;
      await new Promise(r => setTimeout(r, 3000));

      const statusRes = await fetch(`${EXPLEE_BASE_URL}/autogtm/campaigns/import/${task_id}`, {
        headers: { 'X-API-Key': EXPLEE_API_KEY }
      });

      if (!statusRes.ok) {
        console.warn(`⚠️ Intento ${attempts}: Error consultando status (${statusRes.status})`);
        continue;
      }

      const statusData = await statusRes.json();
      console.log(`🔄 [INTENTO ${attempts}]: Status = ${statusData.status}`, statusData.progress || '');

      if (statusData.status === 'completed') {
        completed = true;
        finalResult = statusData.result;
        console.log('🎉 [IMPORTACIÓN COMPLETADA CON ÉXITO]');
        console.log(JSON.stringify(finalResult, null, 2));
      } else if (statusData.status === 'failed') {
        throw new Error(`Importación falló: ${statusData.error}`);
      }
    }

    // Registrar en archivo de estado
    const statusRecord = {
      imported_at: new Date().toISOString(),
      task_id,
      project_id: PROJECT_ID,
      campaign_name: importPayload.name,
      leads_count: importPayload.leads.length,
      result: finalResult
    };

    const statusFilePath = path.resolve('pipeline', 'explee_campaigns_status.json');
    let existingStatus = [];
    if (fs.existsSync(statusFilePath)) {
      try { existingStatus = JSON.parse(fs.readFileSync(statusFilePath, 'utf8')); } catch (e) {}
    }
    existingStatus.push(statusRecord);
    fs.writeFileSync(statusFilePath, JSON.stringify(existingStatus, null, 2), 'utf8');
    console.log(`💾 Registro de campaña guardado en ${statusFilePath}`);

    return finalResult;
  } catch (err) {
    console.error('❌ Error en importación a Explee AutoGTM:', err.message);
    process.exit(1);
  }
}

runImport();
