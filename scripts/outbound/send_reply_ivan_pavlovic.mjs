/**
 * =============================================================================
 * DESPACHO EN VIVO DE RESPUESTA A IVAN PAVLOVIC (52 ENTERTAINMENT)
 * =============================================================================
 * Agente de Ventas & Cierre: Despacho 100% desatendido por red real (SMTPS TLS 465)
 * =============================================================================
 */

import { dispatchUniversalEmail } from '../../lib/universal_email_engine.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function sendReplyToIvan() {
  console.log('🚀 [SALES CLOSER]: Iniciando despacho en red real para Ivan Pavlovic (52 Entertainment)...');

  const recipient = 'ivan.pavlovic@52-entertainment.com';
  const subject = 'Re: Support et facturation chez 52 Entertainment';
  
  const textBody = `Bonjour Ivan,

Ravi de votre retour.

Pour un écosystème comme 52 Entertainment (28 millions de joueurs mensuels sur des jeux à abonnement), la perte silencieuse de revenus provient généralement de deux points de friction critiques :
1. Les échecs de paiement et renouvellements passifs non interceptés en temps réel (cartes expirées, blocages 3D-Secure ou alertes bancaires sans relance immédiate).
2. La saturation du support membre sur les questions de facturation et de réclamations de crédits en jeu.

Notre agent autonome Unblock AI Shield s'exécute 100% en mémoire RAM (SOC-2, zéro rétention de données sensibles) et surveille ces flux 24/7 pour récupérer automatiquement les abonnés en risque de désabonnement.

Vous pouvez consulter l'analyse de sécurité et de flux de votre périmètre ici :
👉 https://unblock-shield.vercel.app/?domain=52-entertainment.com&lang=en

Je finalise pour vous la note technique exécutive de 2 pages avec les 3 optimisations prioritaires pour vos jeux et vous la transmets directement par email.

Bien à vous,
Evan Murphy — Unblock AI Shield
Boltech Group Holding`;

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; max-width: 600px;">
  <p>Bonjour Ivan,</p>
  
  <p>Ravi de votre retour.</p>
  
  <p>Pour un écosystème comme <strong>52 Entertainment</strong> (28 millions de joueurs mensuels sur des jeux à abonnement), la perte silencieuse de revenus provient généralement de deux points de friction critiques :</p>
  
  <ol style="padding-left: 20px; margin: 12px 0;">
    <li style="margin-bottom: 8px;"><strong>Les échecs de paiement et renouvellements passifs non interceptés en temps réel</strong> (cartes expirées, blocages 3D-Secure ou alertes bancaires sans relance immédiate).</li>
    <li style="margin-bottom: 8px;"><strong>La saturation du support membre</strong> sur les questions de facturation et de réclamations de crédits en jeu.</li>
  </ol>
  
  <p>Notre agent autonome <strong>Unblock AI Shield</strong> s'exécute 100% en mémoire RAM (SOC-2, zéro rétention de données sensibles) et surveille ces flux 24/7 pour récupérer automatiquement les abonnés en risque de désabonnement.</p>
  
  <p style="margin: 18px 0; padding: 12px 16px; background-color: #f1f5f9; border-left: 4px solid #3b82f6; border-radius: 4px;">
    📊 <strong>Accès direct au diagnostic en ligne :</strong><br>
    <a href="https://unblock-shield.vercel.app/?domain=52-entertainment.com&lang=en" style="color: #2563eb; text-decoration: none; font-weight: 600;">
      👉 https://unblock-shield.vercel.app/?domain=52-entertainment.com
    </a>
  </p>
  
  <p>Je finalise pour vous la <strong>note technique exécutive de 2 pages</strong> avec les 3 optimisations prioritaires pour vos jeux et vous la transmets directement par email.</p>
  
  <p style="margin-top: 24px; color: #475569;">
    Bien à vous,<br>
    <strong>Evan Murphy</strong><br>
    <span style="font-size: 12px; color: #64748b;">Senior Operations & Security Specialist — Unblock AI Shield</span><br>
    <span style="font-size: 11px; color: #94a3b8;">Boltech Group Holding • Autonomous Infrastructure</span>
  </p>
</div>
`;

  const result = await dispatchUniversalEmail({
    to: recipient,
    subject: subject,
    text: textBody,
    html: htmlBody
  });

  if (result.success) {
    console.log('✅ [CORREO DESPACHADO CON ÉXITO EN RED REAL]:');
    console.log(`- Destinatario: ${recipient}`);
    console.log(`- Asunto: ${subject}`);
    console.log(`- Transporte: ${result.transport}`);
    console.log(`- MessageId: ${result.messageId}`);

    // Registrar en el pipeline activo
    const pipelineFile = path.resolve('pipeline', 'leads_contactados_activos.json');
    if (fs.existsSync(pipelineFile)) {
      try {
        const pipeline = JSON.parse(fs.readFileSync(pipelineFile, 'utf8'));
        const lead = pipeline.find(l => l.contactEmail === recipient || l.domain === '52-entertainment.com');
        if (lead) {
          lead.status = 'RESPUESTA_DESPACHADA_POR_AGENTE';
          lead.lastReplySentAt = new Date().toISOString();
          lead.messageId = result.messageId;
          fs.writeFileSync(pipelineFile, JSON.stringify(pipeline, null, 2), 'utf8');
          console.log('📋 Pipeline fiduciario actualizado con el registro del envío.');
        }
      } catch (e) {
        console.warn('Error actualizando pipeline:', e.message);
      }
    }
  } else {
    console.error('❌ [ERROR EN EL ENVÍO]:', result.error);
  }
}

sendReplyToIvan().catch(console.error);
