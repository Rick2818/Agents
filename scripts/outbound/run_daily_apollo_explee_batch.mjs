/**
 * =============================================================================
 * EJECUCIÓN DEL LOTE DIARIO APOLLO.IO + MOTOR DUAL + EXPLEE (35 LEADS)
 * =============================================================================
 * Cumplimiento estricto de la Regla de Oro 18 (Boltech-Group)
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { enrichCompanyWithApollo } from './apollo_b2b_prospector.mjs';
import { executeDailyMasterPipeline } from './master_fiduciary_b2b_engine.mjs';

async function runDailyBatch() {
  console.log('🚀 [APOLLO + EXPLEE PIPELINE]: Cargando leads verificados para la jornada...');
  
  const leadsFile = path.resolve('pipeline', 'leads_explee_ai_verificados.json');
  if (!fs.existsSync(leadsFile)) {
    console.error('❌ Archivo de leads no encontrado');
    return;
  }

  const rawLeads = JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
  const targetBatch = rawLeads.slice(0, 15); // Tomamos el bloque prioritario

  console.log(`📦 Procesando bloque de ${targetBatch.length} organizaciones con Apollo.io & Motor Dual...`);

  const enrichedBatch = [];

  for (const item of targetBatch) {
    console.log(`\n🔎 [APOLLO ENRICH]: Consultando ${item.domain}...`);
    const apolloData = await enrichCompanyWithApollo(item.domain);
    
    enrichedBatch.push({
      name: apolloData?.name || item.company,
      title: 'Oficial de Seguridad / Dirección Técnica',
      company: apolloData?.name || item.company,
      domain: item.domain,
      contactEmail: item.contactEmail,
      phone: apolloData?.phone || item.phone,
      industry: apolloData?.industry || item.industry,
      technologies: apolloData?.technologies || []
    });
  }

  console.log('\n⚡ Ejecutando Pipeline Fiduciario Maestro sobre el lote enriquecido...');
  const result = await executeDailyMasterPipeline(enrichedBatch);

  console.log(`\n🎉 [JORNADA COMPLETADA]: ${result.processedResults.length} leads auditados, enriquecidos y sincronizados.`);
}

runDailyBatch().catch(console.error);
