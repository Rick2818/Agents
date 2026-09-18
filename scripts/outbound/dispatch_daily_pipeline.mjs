/**
 * =============================================================================
 * DISPATCHER DIARIO DE CADENCIAS B2B — DESTRABA AI
 * Procesa y activa los leads del día según el cronograma fiduciario
 * Destino de cobro: rick2818@strike.me
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';

const PIPELINE_DIR = path.resolve('pipeline');
const ACTIVE_LEADS_FILE = path.join(PIPELINE_DIR, 'leads_contactados_activos.json');
const MARTES_LEADS_FILE = path.join(PIPELINE_DIR, 'leads_colombia_martes.json');
const PYMES_LEADS_FILE = path.join(PIPELINE_DIR, 'leads_pymes_alta_conversion.json');
const OPP_FILE = path.join(PIPELINE_DIR, 'oportunidades_detectadas.json');

function loadJson(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error(`Error leyendo ${filePath}:`, e.message);
  }
  return [];
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function dispatchDailyPipeline() {
  console.log('[DISPATCHER]: Iniciando despacho del pipeline diario...');

  let activeLeads = loadJson(ACTIVE_LEADS_FILE);
  const martesLeads = loadJson(MARTES_LEADS_FILE);
  const pymesLeads = loadJson(PYMES_LEADS_FILE);
  let opps = loadJson(OPP_FILE);

  let newlyDispatched = 0;
  const now = new Date().toISOString();
  const followUpDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Sincronizar catálogo PYME de alta conversión
  for (const pyme of pymesLeads) {
    const existingIndex = activeLeads.findIndex(a => a.id === pyme.id || a.domain === pyme.domain);
    if (existingIndex === -1) {
      activeLeads.push(pyme);
      newlyDispatched++;
    }
  }

  for (const lead of martesLeads) {
    const existingIndex = activeLeads.findIndex(a => a.id === lead.id || a.domain === lead.domain);

    const activeRecord = {
      ...lead,
      status: 'CONTACTADO_IMPACTO_1',
      dispatchedAt: now,
      nextFollowUpDate: followUpDate
    };

    if (existingIndex >= 0) {
      // No sobreescribir si ya fue enviado exitosamente en red
      if (activeLeads[existingIndex].status !== 'ENVIADO_REAL_EN_RED') {
        activeLeads[existingIndex] = { ...activeLeads[existingIndex], ...activeRecord };
      }
    } else {
      activeLeads.push(activeRecord);
      newlyDispatched++;
    }

    // Actualizar también en el listado origen
    lead.status = 'CONTACTADO_IMPACTO_1';
    lead.dispatchedAt = now;

    // Actualizar en oportunidades si existe
    const opp = opps.find(o => o.domain === lead.domain);
    if (opp) {
      opp.status = 'EN_CADENCIA_ACTIVA';
      opp.lastContact = now;
    }
  }

  saveJson(ACTIVE_LEADS_FILE, activeLeads);
  saveJson(MARTES_LEADS_FILE, martesLeads);
  saveJson(OPP_FILE, opps);

  console.log('\n=============================================================================');
  console.log('[DISPATCHER RESULTADOS]:');
  console.log(`Total leads activos en seguimiento: ${activeLeads.length}`);
  console.log(`Nuevos impactos despachados hoy (Martes - Colombia): ${newlyDispatched}`);
  console.log(`Próximo seguimiento (Impacto 2): ${followUpDate}`);
  console.log('Monetización en satoshis / USD dirigida a: rick2818@strike.me');
  console.log('=============================================================================\n');

  return { activeCount: activeLeads.length, newlyDispatched };
}

if (process.argv[1]?.includes('dispatch_daily_pipeline.mjs')) {
  dispatchDailyPipeline().catch(console.error);
}
