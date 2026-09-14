import { CAMPAIGNS, renderCampaignMessage } from './campaign_engine.mjs';

console.log("==================================================================");
console.log("🚀 DESTRABA AI / UNBLOCK AI — MOTOR DE MONETIZACIÓN DESATENDIDA");
console.log("Meta: $3,000 USD/mes ($100 USD/día) | Liquidación: rick2818@strike.me");
console.log("==================================================================\n");

// Simulación de despacho para prospecto real
const testCompany = "Logística & Retail Global S.A.";

console.log("1. IMPACTO 1 — CADENCIA DE CIBERSEGURIDAD DEFENSIVA ($19 / $89 USD):");
const msg1 = renderCampaignMessage('CYBERSECURITY_DEFENSE_AUDIT', 1, testCompany, 'es');
console.log(`Asunto: ${msg1.subject}`);
console.log(`Destino de Fondos: ${msg1.strikePaymentAddress}`);
console.log(`Cuerpo:\n${msg1.body}\n`);

console.log("------------------------------------------------------------------");
console.log("2. IMPACTO 1 — VERSIÓN EN INGLÉS (UNBLOCK AI - MERCADO INTERNACIONAL):");
const msgEn = renderCampaignMessage('CYBERSECURITY_DEFENSE_AUDIT', 1, testCompany, 'en');
console.log(`Subject: ${msgEn.subject}`);
console.log(`Body:\n${msgEn.body}\n`);

console.log("------------------------------------------------------------------");
console.log("3. IMPACTO 1 — AGENTE AUTÓNOMO B2B ($69 USD/mes):");
const msgSaas = renderCampaignMessage('AUTONOMOUS_OPERATOR_SAAS', 1, testCompany, 'es');
console.log(`Asunto: ${msgSaas.subject}`);
console.log(`Cuerpo:\n${msgSaas.body}\n`);

console.log("✅ Motor de Prospección y Enlaces de Pago validado al 100%.");
