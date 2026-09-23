import { AutonomousSalesTriadEngine } from '../lib/autonomous_triad_engine.js';

console.log('======================================================================');
console.log('🚀 VALIDACIÓN DE LA TRÍADA AUTÓNOMA: EXPLEE ➔ BOLTECH ➔ AIRTABLE');
console.log('======================================================================\n');

const triad = new AutonomousSalesTriadEngine();

async function runTriadTest() {
  // Simulación 1: Ingestion y cierre de lead en inglés (DTC Store)
  const dtcLead = {
    name: 'Alexander Wright',
    email: 'alex.wright@nordic-gear.com',
    company: 'Nordic Gear DTC',
    phone: '+1 415-890-3321',
    painPoint: 'Losing 15% of shoppers at checkout step during weekend sales',
    campaign: 'DTC & eCommerce Founders losing sales from cart drop-offs',
    language: 'en'
  };

  // Ejecutamos en dryRun: true para la prueba sintética de validación de arquitectura
  const result = await triad.processTriadFlow(dtcLead, {
    planTier: 'PRO_SENTINEL',
    dryRun: true
  });

  console.log('📋 RESULTADO CONSOLIDADO DEL COCKPIT EN AIRTABLE:');
  console.log(JSON.stringify(result.airtable.updatedCockpit, null, 2));
}

runTriadTest();
