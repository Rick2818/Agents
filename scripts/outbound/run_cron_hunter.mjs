/**
 * =============================================================================
 * EJECUTOR AUTOMATIZADO 24/7 DEL CAZADOR PERIMETRAL
 * Corre desatendido vía GitHub Actions / Cloud Cron
 * =============================================================================
 */

import { AutonomousHunter } from './autonomous_hunter.mjs';
import { dispatchDailyPipeline } from './dispatch_daily_pipeline.mjs';

const TARGET_PROSPECTS = [
  { company: "TCC Logística", domain: "tcc.com.co", contactEmail: "contacto@tcc.com.co", country: "Colombia", industry: "Courier & Envíos" },
  { company: "Servientrega Corporativo", domain: "servientrega.com", contactEmail: "servicioalcliente@servientrega.com", country: "Colombia", industry: "Logística 3PL" },
  { company: "Estafeta Carga", domain: "estafeta.com", contactEmail: "proyectos@estafeta.com", country: "México", industry: "Paquetería y Cadena de Suministro" },
  { company: "Redpack Logística", domain: "redpack.com.mx", contactEmail: "contacto@redpack.com.mx", country: "México", industry: "Distribución B2B" },
  { company: "Blue Express", domain: "blue.cl", contactEmail: "soporte@blue.cl", country: "Chile", industry: "Last Mile Fulfillment" },
  { company: "Chilexpress Empresas", domain: "chilexpress.cl", contactEmail: "empresas@chilexpress.cl", country: "Chile", industry: "Envíos Corporativos" }
];

async function main() {
  console.log(`[CRON 24/7]: Iniciando escaneo perimetral autónomo de ${TARGET_PROSPECTS.length} objetivos...`);
  const hunter = new AutonomousHunter();
  const results = await hunter.runBatch(TARGET_PROSPECTS);

  const vulnerable = results.filter(r => r.flawsCount > 0);
  console.log(`\n=============================================================================`);
  console.log(`[CRON 24/7 RESULTADOS]:`);
  console.log(`Total escaneados: ${results.length}`);
  console.log(`Con brechas de seguridad monetizables: ${vulnerable.length}`);
  console.log(`Pipeline de ventas fiduciario generado con ofertas de $19 USD / $69 USD`);
  console.log(`Destino de liquidación: rick2818@strike.me`);
  console.log(`=============================================================================\n`);

  // Ejecución y sincronización del pipeline diario de prospección
  await dispatchDailyPipeline();
}

main().catch(console.error);
