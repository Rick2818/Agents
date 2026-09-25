/**
 * =============================================================================
 * PROCESADOR MAESTRO DE LEADS EXPORTADOS DE APOLLO.IO — REGLA DE ORO 18
 * =============================================================================
 * - Ingesta CSV oficial de Apollo.io (Lista 1)
 * - Validación Zero-Bounce en RAM (deep-email-validator)
 * - Inspección técnico Dual en Vivo (Vulnerabilidades perimetrales + Latencia)
 * - Generación de Enlaces y Briefs Fiduciarios ($19 Flash / $69 Pro / rick2818@strike.me)
 * - Sincronización Inmutable a Airtable Master y Pipeline Activo
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import dns from 'dns';
import 'dotenv/config';
import validator from 'validator';
import { validate as deepValidateEmail } from 'deep-email-validator';

// Configurar DNS soberano de alta velocidad para resolución MX
dns.setServers(['8.8.8.8', '1.1.1.1']);
import { runDualEngineAudit, generateExpleeVisualPayload, syncLeadToAirtable, runSelfOptimizationLoop } from './master_fiduciary_b2b_engine.mjs';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

export async function processApolloExportBatch() {
  console.log('=============================================================================');
  console.log('🚀 PROCESANDO LOTE DE LEADS APOLLO.IO (LISTA 1) — PROTOCOLO FIDUCIARIO');
  console.log('=============================================================================');

  const csvPath = path.resolve('data', 'apollo_leads_batch_1.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Archivo CSV de Apollo no encontrado en data/apollo_leads_batch_1.csv');
    return;
  }

  const rawContent = fs.readFileSync(csvPath, 'utf8');
  const lines = rawContent.split(/\r?\n/).filter(l => l.trim().length > 0);

  if (lines.length < 2) {
    console.error('❌ El archivo CSV no contiene registros.');
    return;
  }

  const headers = parseCSVLine(lines[0]);
  const firstNameIdx = headers.indexOf('First Name');
  const lastNameIdx = headers.indexOf('Last Name');
  const titleIdx = headers.indexOf('Title');
  const companyIdx = headers.indexOf('Company Name');
  const emailIdx = headers.indexOf('Email');
  const websiteIdx = headers.indexOf('Website');
  const countryIdx = headers.indexOf('Country');
  const employeesIdx = headers.indexOf('# Employees');
  const industryIdx = headers.indexOf('Industry');
  const techIdx = headers.indexOf('Technologies');

  console.log(`📊 Total de filas detectadas en CSV: ${lines.length - 1} prospectos.`);

  const processedLeads = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 5) continue;

    const firstName = row[firstNameIdx] || '';
    const lastName = row[lastNameIdx] || '';
    const name = `${firstName} ${lastName}`.trim() || 'Director Ejecutivo';
    const title = row[titleIdx] || 'Director de Operaciones / Tecnología';
    const company = row[companyIdx] || 'Empresa B2B';
    const email = row[emailIdx] || '';
    let domain = row[websiteIdx] || '';
    const country = row[countryIdx] || 'Global';
    const employees = row[employeesIdx] || 'N/A';
    const industry = row[industryIdx] || 'Tecnología y Servicios';
    const technologies = row[techIdx] || '';

    if (!domain && email.includes('@')) {
      domain = email.split('@')[1];
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().toLowerCase();

    if (!email || !cleanDomain) continue;

    console.log(`\n---------------------------------------------------------`);
    console.log(`📌 [${i}/${lines.length - 1}] ${name} (${title}) — ${company} [${cleanDomain}]`);

    // 1. Verificación MX Zero-Bounce en RAM
    const emailCheck = await deepValidateEmail({
      email,
      validateRegex: true,
      validateMx: true,
      validateTypo: false,
      validateDisposable: true,
      validateSMTP: false
    });

    if (!emailCheck.valid) {
      console.warn(`⚠️ [MX REJECT]: ${email} rechazado (${emailCheck.reason}). Omitiendo.`);
      continue;
    }

    // 2. Inspección técnico Dual en Vivo
    const audit = await runDualEngineAudit(cleanDomain);

    // 3. Generación Visual Explee
    const leadObj = { name, title, company, domain: cleanDomain, contactEmail: email, country };
    const explee = generateExpleeVisualPayload(leadObj, audit);

    // 4. Registro Fiduciario
    const record = {
      leadId: `APOLLO_${Date.now()}_${i}`,
      name,
      title,
      company,
      domain: cleanDomain,
      contactEmail: email,
      emailVerified: true,
      country,
      employees,
      industry,
      technologies: technologies.split(',').slice(0, 5).map(t => t.trim()),
      securityStatus: audit.securityStatus,
      latencyMs: audit.latencyMs,
      estimatedBottleneckHours: audit.estimatedBottleneckHours,
      visualAuditUrl: explee.visualAuditUrl,
      checkoutFlashUrl: `https://unblock-shield.vercel.app/?plan=flash&domain=${cleanDomain}`,
      checkoutProUrl: `https://unblock-shield.vercel.app/?plan=pro&domain=${cleanDomain}`,
      strikePaymentUrl: 'https://strike.me/rick2818',
      strikeLightningAddress: 'rick2818@strike.me',
      cadenceStatus: 'IMPACTO_1_LISTO_PARA_TRANSMISION',
      source: 'APOLLO_IO_VERIFIED_EXPORT_LISTA_1'
    };

    await syncLeadToAirtable(record);
    processedLeads.push(record);
  }

  // Guardar en el pipeline activo de Boltech-Group
  const outputFile = path.resolve('pipeline', 'apollo_leads_calificados_activos.json');
  fs.writeFileSync(outputFile, JSON.stringify(processedLeads, null, 2), 'utf8');

  // Ejecutar bucle de auto-evaluación
  const scorecard = runSelfOptimizationLoop();

  console.log('\n=============================================================================');
  console.log(`🎉 [PROCESO EXITOSO]: ${processedLeads.length} directores y CEOs calificados, auditados y sincronizados.`);
  console.log(`📁 Archivo del Pipeline Guardado: ${outputFile}`);
  console.log('=============================================================================');

  return { processedLeads, scorecard };
}

if (process.argv[1]?.endsWith('process_apollo_export_batch.mjs')) {
  processApolloExportBatch().catch(console.error);
}
