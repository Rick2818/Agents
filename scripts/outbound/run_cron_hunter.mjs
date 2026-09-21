/**
 * =============================================================================
 * EJECUTOR AUTOMATIZADO 24/7 DEL CAZADOR PERIMETRAL
 * Corre desatendido vía GitHub Actions / Cloud Cron
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import { AutonomousHunter } from './autonomous_hunter.mjs';
import { dispatchDailyPipeline, advancePipelineToImpact2 } from './dispatch_daily_pipeline.mjs';
import { executeOutboundDispatch } from './send_smtp_dispatch.mjs';
import { sendCloudMessage } from '../../lib/telegram_cloud_processor.js';

// Cargar variables locales si existen
try { process.loadEnvFile?.(); } catch (e) {}

const WEEKLY_COHORTS = {
  1: {
    name: "LUNES 8:45 AM: ICP Alta Conversión (E-commerce D2C, Agencias B2B & Last-Mile)",
    targets: [
      { company: "Kavak México Operations", domain: "kavak.com", contactEmail: "soporte@kavak.com", country: "México", industry: "Fintech & Retail Automotriz" },
      { company: "99Minutos Last Mile", domain: "99minutos.com", contactEmail: "hola@99minutos.com", country: "México / LatAm", industry: "Last Mile Fulfillment" },
      { company: "Starken Chile Logística", domain: "starken.cl", contactEmail: "empresas@starken.cl", country: "Chile", industry: "Transporte Corporativo" },
      { company: "Blue Express Chile", domain: "blue.cl", contactEmail: "soporte@blue.cl", country: "Chile", industry: "Last Mile Fulfillment" },
      { company: "Clicoh Fulfillment", domain: "clicoh.com", contactEmail: "info@clicoh.com", country: "Latam Regional", industry: "Fulfillment E-commerce" },
      { company: "Mensajeros Urbanos B2B", domain: "mensajerosurbanos.com", contactEmail: "contacto@mensajerosurbanos.com", country: "Colombia / México", industry: "Courrier Urbano Corporativo" },
      { company: "Skydropx Plataforma Envíos", domain: "skydropx.com", contactEmail: "hola@skydropx.com", country: "México / Colombia", industry: "Agregador Logístico" },
      { company: "Envia.com Logistics", domain: "envia.com", contactEmail: "soporte@envia.com", country: "México / Latam", industry: "Plataforma Envíos E-commerce" },
      { company: "Simetrik Finanzas", domain: "simetrik.com", contactEmail: "info@simetrik.com", country: "Latam / Global", industry: "Conciliación Financiera" }
    ]
  },
  2: {
    name: "MARTES: Retail & E-commerce D2C de Alta Conversión (Colombia)",
    targets: [
      { company: "Alkosto Hiperahorro", domain: "alkosto.com", contactEmail: "contacto@alkosto.com", country: "Colombia", industry: "Retail & E-commerce" },
      { company: "Totto Maletines & Accesorios", domain: "totto.com", contactEmail: "servicioalcliente@totto.com", country: "Colombia", industry: "Moda & Accesorios D2C" },
      { company: "Bosi Calzado & Cuero", domain: "bosi.com.co", contactEmail: "servicioalcliente@bosi.com.co", country: "Colombia", industry: "Calzado & Retail" },
      { company: "Koaj Moda Urbana", domain: "koaj.co", contactEmail: "contacto@koaj.co", country: "Colombia", industry: "Retail Moda" },
      { company: "Tennis Moda Casual", domain: "tennis.com.co", contactEmail: "servicioalcliente@tennis.com.co", country: "Colombia", industry: "Moda & E-commerce" },
      { company: "Lentesplus Óptica Online", domain: "lentesplus.com", contactEmail: "contacto@lentesplus.com", country: "Colombia / México", industry: "Salud Visual D2C" },
      { company: "Chiper Supermercado Digital B2B", domain: "chiper.co", contactEmail: "contacto@chiper.co", country: "Colombia", industry: "Abastecimiento B2B" },
      { company: "Farmatodo Colombia", domain: "farmatodo.com.co", contactEmail: "contacto@farmatodo.com.co", country: "Colombia", industry: "Farmacia & E-commerce" },
      { company: "Merqueo Supermercado Online", domain: "merqueo.com", contactEmail: "contacto@merqueo.com", country: "Colombia", industry: "Supermercado Digital" },
      { company: "RobinFood Cloud Kitchens", domain: "robinfood.com", contactEmail: "contacto@robinfood.com", country: "Colombia", industry: "FoodTech" },
      { company: "Dafiti Colombia Moda", domain: "dafiti.com.co", contactEmail: "info@dafiti.com.co", country: "Colombia", industry: "Moda E-commerce" },
      { company: "Panamericana Librería y Papelería", domain: "panamericana.com.co", contactEmail: "servicioalcliente@panamericana.com.co", country: "Colombia", industry: "Retail & Papelería" }
    ]
  },
  3: {
    name: "MIÉRCOLES: Software, Retail & E-commerce Cross-Border (España)",
    targets: [
      { company: "PcComponentes Tecnología", domain: "pccomponentes.com", contactEmail: "soporte@pccomponentes.com", country: "España", industry: "E-commerce Tecnología" },
      { company: "Cecotec Electrodomésticos", domain: "cecotec.es", contactEmail: "soporte@cecotec.es", country: "España", industry: "Hardware & Hogar D2C" },
      { company: "Hawkers Gafas de Sol", domain: "hawkersco.com", contactEmail: "contacto@hawkersco.com", country: "España / Global", industry: "Óptica D2C" },
      { company: "Bulevip Nutrición Deportiva", domain: "bulevip.com", contactEmail: "info@bulevip.com", country: "España", industry: "Nutrición Deportiva" },
      { company: "Tiendanimal Mascotas", domain: "tiendanimal.es", contactEmail: "atencioncliente@tiendanimal.es", country: "España", industry: "Pet Retail" },
      { company: "Kiwoko Tienda de Animales", domain: "kiwoko.com", contactEmail: "clientes@kiwoko.com", country: "España", industry: "Pet-Commerce" },
      { company: "Tradeinn Deportes & E-commerce", domain: "tradeinn.com", contactEmail: "soporte@tradeinn.com", country: "España", industry: "Outdoor & Deportes" },
      { company: "Promofarma Parafarmacia", domain: "promofarma.com", contactEmail: "clientes@promofarma.com", country: "España", industry: "Salud & Belleza" },
      { company: "Deporvillage Ropa Ciclismo", domain: "deporvillage.com", contactEmail: "comunicacion@deporvillage.com", country: "España", industry: "Ciclismo & Outdoor" },
      { company: "Singularu Joyas Online", domain: "singularu.com", contactEmail: "atencion@singularu.com", country: "España", industry: "Joyería D2C" },
      { company: "Atida / Mifarma", domain: "atida.com", contactEmail: "soporte@atida.com", country: "España", industry: "Parafarmacia Online" },
      { company: "El Ganso Moda & Accesorios", domain: "elganso.com", contactEmail: "atencioncliente@elganso.com", country: "España", industry: "Moda & Calzado" }
    ]
  },
  4: {
    name: "JUEVES: Fintechs, Retail y Pasarelas de Pago (México)",
    targets: [
      { company: "El Palacio de Hierro", domain: "elpalaciodehierro.com", contactEmail: "atencion@elpalaciodehierro.com", country: "México", industry: "Retail Departamental" },
      { company: "Sears México", domain: "sears.com.mx", contactEmail: "contacto@sears.com.mx", country: "México", industry: "Retail & E-commerce" },
      { company: "Soriana Tiendas", domain: "soriana.com", contactEmail: "ayuda@soriana.com", country: "México", industry: "Supermercados Retail" },
      { company: "Farmacias del Ahorro", domain: "fahorro.com", contactEmail: "contacto@fahorro.com", country: "México", industry: "Farmacia & Retail" },
      { company: "Farmacias Benavides", domain: "benavides.com.mx", contactEmail: "contacto@benavides.com.mx", country: "México", industry: "Salud & Bienestar" },
      { company: "Jüsto Supermercado 100% Digital", domain: "justo.mx", contactEmail: "hola@justo.mx", country: "México", industry: "E-Grocery" },
      { company: "Clip Terminales Punto de Venta", domain: "clip.mx", contactEmail: "soporte@clip.mx", country: "México", industry: "Fintech & Pagos" },
      { company: "Konfío Crédito Corporativo", domain: "konfio.mx", contactEmail: "soporte@konfio.mx", country: "México", industry: "Fintech B2B" },
      { company: "Fondeadora Finanzas Digitales", domain: "fondeadora.com", contactEmail: "soporte@fondeadora.com", country: "México", industry: "Neobanco" },
      { company: "Stori Tarjeta de Crédito", domain: "storicard.com", contactEmail: "soporte@storicard.com", country: "México", industry: "Fintech Crédito" },
      { company: "Innova Sport México", domain: "innovasport.com", contactEmail: "contacto@innovasport.com", country: "México", industry: "Retail Deportivo" },
      { company: "Deportes Martí", domain: "marti.mx", contactEmail: "contacto@marti.mx", country: "México", industry: "Artículos Deportivos" },
      { company: "Petco México Mascotas", domain: "petco.com.mx", contactEmail: "contacto@petco.com.mx", country: "México", industry: "Pet Retail" }
    ]
  },
  5: {
    name: "VIERNES: Ciberseguridad Defensiva & E-commerce (Chile, Centroamérica & Global)",
    targets: [
      { company: "Paris Retail Chile", domain: "paris.cl", contactEmail: "contacto@paris.cl", country: "Chile", industry: "Retail Departamental" },
      { company: "Ripley Tiendas Chile", domain: "simple.ripley.cl", contactEmail: "contacto@ripley.cl", country: "Chile", industry: "Retail & E-commerce" },
      { company: "Hites Retail Chile", domain: "hites.com", contactEmail: "contacto@hites.com", country: "Chile", industry: "Tiendas por Departamento" },
      { company: "Casaideas Decoración & Hogar", domain: "casaideas.cl", contactEmail: "contacto@casaideas.cl", country: "Chile", industry: "Hogar & Diseño" },
      { company: "Fintual Inversiones Digitales", domain: "fintual.cl", contactEmail: "hola@fintual.com", country: "Chile / México", industry: "Fintech Inversiones" },
      { company: "NotCo Foodtech", domain: "notco.com", contactEmail: "contacto@notco.com", country: "Chile / Global", industry: "FoodTech" },
      { company: "Freund Ferreterías", domain: "freundferreteria.com", contactEmail: "contacto@freundferreteria.com", country: "El Salvador", industry: "Ferretería Industrial" },
      { company: "Vidrí Ferreterías Industriales", domain: "vidri.com.sv", contactEmail: "contacto@vidri.com.sv", country: "El Salvador", industry: "Materiales & Retail" },
      { company: "Dollar City Centroamérica", domain: "dollarcity.com", contactEmail: "contacto@dollarcity.com", country: "El Salvador / Regional", industry: "Retail Variedades" },
      { company: "Pollo Campero Corporativo", domain: "campero.com", contactEmail: "contacto@campero.com", country: "Guatemala / El Salvador", industry: "Franquicias & Retail" },
      { company: "Hugo Technologies", domain: "hugoapp.com", contactEmail: "soporte@hugoapp.com", country: "Centroamérica", industry: "SuperApp & Delivery" },
      { company: "Aeroman MRO Mantenimiento Aeronáutico", domain: "aeroman.com.sv", contactEmail: "info@aeroman.com.sv", country: "El Salvador", industry: "Mantenimiento Aeronáutico" },
      { company: "Pan Sinaí Alimentos", domain: "pansinai.com", contactEmail: "contacto@pansinai.com", country: "El Salvador", industry: "Industria de Alimentos" },
      { company: "Warby Parker Eyewear", domain: "warbyparker.com", contactEmail: "help@warbyparker.com", country: "USA", industry: "D2C Eyewear" },
      { company: "MVMT Relojes & Accesorios", domain: "mvmt.com", contactEmail: "support@mvmt.com", country: "USA", industry: "D2C Fashion" },
      { company: "Hims & Hers Health D2C", domain: "forhims.com", contactEmail: "support@forhims.com", country: "USA", industry: "Digital Health" },
      { company: "Untuckit Camisas Masculinas", domain: "untuckit.com", contactEmail: "questions@untuckit.com", country: "USA", industry: "D2C Apparel" }
    ]
  }
};

async function main() {
  const dayOfWeek = new Date().getDay(); // 0: Dom, 1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie, 6: Sáb
  const cohort = WEEKLY_COHORTS[dayOfWeek] || WEEKLY_COHORTS[2]; // Fallback a Colombia en fin de semana
  const targets = cohort.targets;

  console.log(`\n=============================================================================`);
  console.log(`[CRON 24/7 AUTONOMOUS HUNTER]: Ciclo Fiduciario Activo`);
  console.log(`Cohort asignado: ${cohort.name}`);
  console.log(`Total de objetivos a auditar: ${targets.length}`);
  console.log(`Destino de liquidación: rick2818@strike.me`);
  console.log(`=============================================================================\n`);

  const hunter = new AutonomousHunter();
  
  // Descubrimiento dinámico continuo de nuevos prospectos no contactados (Anti-Fatiga 90 días)
  const dynamicTargets = await hunter.discoverDynamicTargets({ limit: 3 });
  console.log(`[DISCOVERY MOTOR]: ${dynamicTargets.length} nuevos prospectos dinámicos incorporados al escaneo.`);

  const allTargets = [...targets, ...dynamicTargets];
  const results = await hunter.runBatch(allTargets);

  const vulnerable = results.filter(r => r.flawsCount > 0);
  console.log(`\n=============================================================================`);
  console.log(`[CRON 24/7 RESULTADOS]:`);
  console.log(`Total escaneados: ${results.length}`);
  console.log(`Con brechas de seguridad monetizables: ${vulnerable.length}`);
  console.log(`Pipeline de ventas fiduciario generado con ofertas de $19 USD / $69 USD`);
  console.log(`Destino de liquidación: rick2818@strike.me`);
  console.log(`=============================================================================\n`);

  // Sincronizar los resultados auditados con el pipeline de leads contactados
  const activeLeadsPath = path.resolve('pipeline/leads_contactados_activos.json');
  if (fs.existsSync(activeLeadsPath)) {
    try {
      const activeLeads = JSON.parse(fs.readFileSync(activeLeadsPath, 'utf8'));
      for (const r of results) {
        if (!r.domain) continue;
        const exists = activeLeads.findIndex(a => a.domain?.toLowerCase() === r.domain.toLowerCase());
        const leadRecord = {
          id: r.auditId,
          company: r.company,
          domain: r.domain,
          decisionMakerRole: "Oficial de Seguridad / Dirección de Operaciones",
          country: r.country,
          operationalPain: `Brechas perimetrales detectadas: ${r.flaws.join(', ') || 'Optimización perimetral'}`,
          offer: r.monetization.offer,
          strikePaymentDestination: "rick2818@strike.me",
          checkoutUrl: r.monetization.checkoutDirectApp,
          directStrikePaymentUrl: "https://strike.me/rick2818",
          status: "AUDITADO_Y_LISTO_PARA_NOTIFICACION",
          contactEmail: r.contactEmail,
          outboundMessage: r.generatedDispatchMessage,
          flawsCount: r.flawsCount,
          flaws: r.flaws,
          severity: r.severity
        };
        if (exists >= 0) {
          const currentStatus = activeLeads[exists].status || '';
          const alreadyDispatched = currentStatus.startsWith('ENVIADO') || currentStatus.startsWith('CONTACTADO');
          if (!alreadyDispatched) {
            activeLeads[exists] = { ...activeLeads[exists], ...leadRecord };
          }
        } else {
          activeLeads.unshift(leadRecord);
        }
      }
      fs.writeFileSync(activeLeadsPath, JSON.stringify(activeLeads, null, 2), 'utf8');
      console.log(`[PIPELINE SYNC]: ${results.length} auditorías incorporadas a la cola de contacto.`);
    } catch (err) {
      console.error('[PIPELINE SYNC ERROR]:', err.message);
    }
  }

  const cadenceAction = process.env.CADENCE_ACTION || 'all';

  // 1. Ejecución y sincronización del pipeline diario de prospección
  if (cadenceAction !== 'impact_2_video_followup') {
    await dispatchDailyPipeline();
  }

  // 2. Avance de cadencia a Impacto 2 (Video Briefing Ejecutivo de 70s)
  if (cadenceAction === 'all' || cadenceAction === 'impact_2_video_followup') {
    const forceAll = cadenceAction === 'impact_2_video_followup';
    await advancePipelineToImpact2({ forceAll, minHours: 48 });
  }

  // 3. Transmisión autónoma outbound (SMTP / REST API / DRY_RUN)
  await executeOutboundDispatch();

  // 3. Notificación Ejecutiva a Telegram de Ricardo (Cierre de Ciclo 10/10)
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_AUTHORIZED_USER_ID || '6311509947';
    if (botToken) {
      const summaryMsg = `🎯 <b>CAZADOR AUTÓNOMO 24/7 (REPORTE DE CICLO)</b>\n\n` +
        `📅 <b>Cohorte:</b> ${cohort.name}\n` +
        `🔍 <b>Objetivos Escaneados:</b> ${results.length}\n` +
        `⚡ <b>Brechas Detectadas:</b> ${vulnerable.length}\n` +
        `📬 <b>Cadencias Despachadas:</b> Ofertas de $19 / $69 USD emitidas\n` +
        `🛡️ <b>Destino de Cobro:</b> <code>rick2818@strike.me</code>\n` +
        `🕒 <b>Hora:</b> ${new Date().toISOString()}`;
      await sendCloudMessage(adminChatId, summaryMsg, botToken, { isRawHtml: true });
      console.log('[CRON 24/7]: Resumen ejecutivo notificado exitosamente a Telegram.');
    }
  } catch (e) {
    console.error('[CRON TELEGRAM NOTIFICATION ERROR]:', e.message);
  }
}

main().catch(console.error);
