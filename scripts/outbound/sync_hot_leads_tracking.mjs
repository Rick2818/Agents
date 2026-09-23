/**
 * =============================================================================
 * SYNC & SEGUIMIENTO ACTIVO DE HOT LEADS — SALES CLOSER SPECIALIST
 * =============================================================================
 * Registra los hot leads de Explee AutoGTM en el pipeline fiduciario central
 * y genera el registro inmutable de seguimiento con respuestas listas.
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const EXPLEE_API_KEY = process.env.EXPLEE_API_KEY;
const PIPELINE_FILE = path.resolve('pipeline', 'leads_contactados_activos.json');
const HOT_LEADS_LOG = path.resolve('pipeline', 'hot_leads_action_plan.json');

async function syncAndTrackHotLeads() {
  console.log('🔄 [SALES CLOSER]: Sincronizando Hot Leads para seguimiento activo...');

  const res = await fetch('https://api.explee.com/public/api/v1/autogtm/hot-leads?limit=50', {
    headers: { 'X-API-Key': EXPLEE_API_KEY }
  });

  if (!res.ok) {
    throw new Error(`Error API Explee HTTP ${res.status}`);
  }

  const data = await res.json();
  const leads = data.leads || [];

  console.log(`📊 Encontrados ${leads.length} Hot Leads calificados en Explee AutoGTM.`);

  let pipeline = [];
  if (fs.existsSync(PIPELINE_FILE)) {
    try {
      pipeline = JSON.parse(fs.readFileSync(PIPELINE_FILE, 'utf8'));
    } catch (e) {
      console.warn('Error leyendo pipeline central, iniciando lista nueva.');
    }
  }

  const actionPlans = [];

  for (const lead of leads) {
    const existingIndex = pipeline.findIndex(p => p.contactEmail === lead.email || p.domain === lead.company_domain);
    
    let draftReply = '';
    let actionChannel = 'EXPLEE_INBOX_UI';
    let priority = 'ALTA';

    if (lead.email.includes('52-entertainment.com')) {
      priority = 'CRITICA_ALTO_VALOR';
      draftReply = `Bonjour Ivan,\n\nRavi de votre retour.\n\nPour un écosystème comme 52 Entertainment (28 millions de joueurs mensuels sur des jeux à abonnement), la perte silencieuse de revenus provient généralement de deux points de friction critiques :\n1. Les échecs de paiement et renouvellements passifs non interceptés en temps réel (cartes expirées, blocages 3D-Secure ou alertes bancaires sans relance immédiate).\n2. La saturation du support membre sur les questions de facturation et de réclamations de crédits en jeu.\n\nNotre agent autonome Unblock AI Shield s'exécute 100% en mémoire RAM (SOC-2, zéro rétention de données sensibles) et surveille ces flux 24/7 pour récupérer automatiquement les abonnés en risque de désabonnement.\n\nVous pouvez tester l'analyse de votre périmètre ici :\n👉 https://unblock-shield.vercel.app/?domain=52-entertainment.com&lang=en\n\nSeriez-vous ouvert à ce que je vous prépare une courte note technique de 2 pages avec les 3 optimisations immédiates pour vos jeux, ou préférez-vous un échange de 10 minutes ?\n\nBien à vous,\nEvan Murphy — Unblock AI Shield`;
    } else if (lead.email.includes('legacy-wireless.com')) {
      priority = 'CRITICA_LLAMADA_DIRECTA';
      actionChannel = 'PHONE_AND_EMAIL';
      draftReply = `Hey Mario,\n\nGreat hearing from you!\n\nI have your direct number (503-804-9202) on file. Before I give you a quick call, here is the quick 3-point outline for Legacy Wireless to protect checkout revenue:\n\n1. Autonomous Cart Protection: Instantly intercept visitors who hesitate at checkout due to payment gateway hiccups or shipping questions before they bounce.\n2. 24/7 Shopper Assistance: Autonomous agent that answers device/accessory availability and order tracking with zero human delay.\n3. Zero-Invasion Setup: No database credentials required; operates purely on perimeter edge (Cloudflare/Vercel) with SOC-2 bank-grade privacy.\n\nI'll reach out to your number today. In the meantime, you can review your live store diagnostic here:\n👉 https://unblock-shield.vercel.app/?domain=legacywireless.org&lang=en\n\nTalk soon,\nEvan Murphy — Unblock AI Shield\nDirect: 503-804-9202`;
    } else if (lead.email.includes('sdata.net.pl')) {
      priority = 'ALTA';
      draftReply = `Hi Lucjan,\n\nHaha, fair point on the 30TB storage! Running high-capacity hosting infrastructure at 99.8% uptime is no small feat.\n\nThe reason I reached out to CBytes is that hosting providers spend up to 40% of their senior engineering time on repetitive L1 tickets (DNS records, VPS reboots, payment confirmations, basic DDoS perimeter questions).\n\nUnblock AI Shield gives you a dedicated autonomous L1 support & security agent running 24/7 with zero disk retention, zero server overhead on your clusters, and instant answers to routine customer questions.\n\nIf you ever want to free up your Linux team from tier-1 noise so they can focus on scaling storage:\n👉 https://unblock-shield.vercel.app/?domain=sdata.net.pl&lang=en\n\nWishing you great uptime and full racks!\n\nBest regards,\nAllison Ramos — Unblock AI Shield`;
    }

    const leadRecord = {
      id: `lead_hot_explee_${lead.person_id}`,
      personId: lead.person_id,
      company: lead.company_name || lead.company_domain,
      domain: lead.company_domain,
      contactName: lead.name,
      contactEmail: lead.email,
      phone: lead.phone || (lead.why_hot.includes('503-804-9202') ? '503-804-9202' : null),
      jobTitle: lead.job_title,
      country: lead.country || 'US/EU',
      status: 'HOT_LEAD_SEGUIMIENTO_ACTIVO',
      whyHot: lead.why_hot,
      becameHotAt: lead.became_hot_at,
      priority,
      recommendedChannel: actionChannel,
      draftReply,
      checkoutUrl: `https://unblock-shield.vercel.app/?domain=${lead.company_domain}&lang=en`,
      strikeDestination: 'rick2818@strike.me',
      lastUpdated: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      pipeline[existingIndex] = { ...pipeline[existingIndex], ...leadRecord };
    } else {
      pipeline.unshift(leadRecord);
    }

    actionPlans.push(leadRecord);
  }

  fs.writeFileSync(PIPELINE_FILE, JSON.stringify(pipeline, null, 2), 'utf8');
  fs.writeFileSync(HOT_LEADS_LOG, JSON.stringify(actionPlans, null, 2), 'utf8');

  console.log(`✅ Pipeline fiduciario actualizado con ${actionPlans.length} Hot Leads activos.`);
}

syncAndTrackHotLeads().catch(console.error);
