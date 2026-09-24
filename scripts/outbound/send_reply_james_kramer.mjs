/**
 * =============================================================================
 * DESPACHO EN VIVO DE RESPUESTA A JAMES KRAMER / MARIO (LEGACY WIRELESS)
 * =============================================================================
 * Agente de Ventas & Cierre: Despacho 100% desatendido por red real (SMTPS TLS 465)
 * =============================================================================
 */

import { dispatchUniversalEmail } from '../../lib/universal_email_engine.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function sendReplyToJames() {
  console.log('🚀 [SALES CLOSER]: Iniciando despacho en red real para James Kramer / Mario (Legacy Wireless)...');

  const recipient = 'jkramer@legacy-wireless.com';
  const subject = 'Re: Checkout questions at Legacy Wireless';
  
  const textBody = `Hey Mario,

Great hearing from you!

I have your direct number (503-804-9202) on file. Before I give you a quick call, here is the quick 3-point outline for Legacy Wireless to protect checkout revenue:

1. Autonomous Cart Protection: Instantly intercept visitors who hesitate at checkout due to payment gateway hiccups or shipping questions before they bounce.
2. 24/7 Shopper Assistance: Autonomous agent that answers device/accessory availability and order tracking with zero human delay.
3. Zero-Invasion Setup: No database credentials required; operates purely on perimeter edge (Cloudflare/Vercel) with SOC-2 bank-grade privacy.

In the meantime, you can review your live store diagnostic here:
👉 https://unblock-shield.vercel.app/?domain=legacywireless.org&lang=en

Talk soon,
Evan Murphy — Unblock AI Shield
Boltech Group Holding`;

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; max-width: 600px;">
  <p>Hey Mario,</p>
  
  <p>Great hearing from you!</p>
  
  <p>I have your direct number (<strong>503-804-9202</strong>) on file. Here is the quick 3-point outline for Legacy Wireless to protect checkout revenue:</p>
  
  <ol style="padding-left: 20px; margin: 12px 0;">
    <li style="margin-bottom: 8px;"><strong>Autonomous Cart Protection:</strong> Instantly intercept visitors who hesitate at checkout due to payment gateway hiccups or shipping questions before they bounce.</li>
    <li style="margin-bottom: 8px;"><strong>24/7 Shopper Assistance:</strong> Autonomous agent that answers device/accessory availability and order tracking with zero human delay.</li>
    <li style="margin-bottom: 8px;"><strong>Zero-Invasion Setup:</strong> No database credentials required; operates purely on perimeter edge with SOC-2 bank-grade privacy.</li>
  </ol>
  
  <p style="margin: 18px 0; padding: 12px 16px; background-color: #f1f5f9; border-left: 4px solid #3b82f6; border-radius: 4px;">
    📊 <strong>Direct access to live store diagnostic:</strong><br>
    <a href="https://unblock-shield.vercel.app/?domain=legacywireless.org&lang=en" style="color: #2563eb; text-decoration: none; font-weight: 600;">
      👉 https://unblock-shield.vercel.app/?domain=legacywireless.org
    </a>
  </p>
  
  <p style="margin-top: 24px; color: #475569;">
    Talk soon,<br>
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

    // Actualizar tracking
    const planFile = path.resolve('pipeline', 'hot_leads_action_plan.json');
    if (fs.existsSync(planFile)) {
      try {
        const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
        const lead = plan.find(l => l.contactEmail === recipient || l.domain === 'legacywireless.org');
        if (lead) {
          lead.status = 'RESPUESTA_DESPACHADA_POR_AGENTE';
          lead.lastRepliedAt = new Date().toISOString();
          lead.messageId = result.messageId;
          fs.writeFileSync(planFile, JSON.stringify(plan, null, 2), 'utf8');
        }
      } catch (e) {
        console.warn('Error actualizando plan:', e.message);
      }
    }
  } else {
    console.error('❌ [ERROR EN EL ENVÍO]:', result.error);
  }
}

sendReplyToJames().catch(console.error);
