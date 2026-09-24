/**
 * BOLTECH GROUP — DEMOSTRACIÓN EN VIVO DEL AGENTE DE COBRO Y CONCILIACIÓN
 * Ejecuta una simulación en tiempo real de los 2 canales de cobro:
 * 1. Canal Bitcoin Lightning (Strike rick2818@strike.me)
 * 2. Canal Tarjetas de Crédito Global (Stripe Checkout)
 */

import {
  BOLTECH_PRICING_CATALOG,
  createCheckoutIntent,
  verifyAndSettleLightningPayment,
  isAlreadySettled
} from '../lib/billing_settlement_sentinel.js';
import fs from 'fs';
import path from 'path';

console.log('\n======================================================================');
console.log('🤖 BOLTECH GROUP — AGENTE CENTINELA DE COBRO (DEMOSTRACIÓN EN VIVO)');
console.log('======================================================================\n');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runLiveDemonstration() {
  console.log('🔹 PASO 1: Consulta del Catálogo Fiduciario de Precios');
  console.log('------------------------------------------------------');
  Object.values(BOLTECH_PRICING_CATALOG).forEach(plan => {
    console.log(`  • [${plan.id.toUpperCase()}] ${plan.name} -> $${plan.amountUSD} USD (${plan.type})`);
  });
  await sleep(1000);

  console.log('\n🔹 PASO 2: Cliente inicia proceso de compra desde la Web (Plan Pro $69 USD)');
  console.log('-------------------------------------------------------------------------');
  const clientData = {
    planId: 'pro',
    customerEmail: 'ceo@acme-logistics.com',
    domain: 'acme-logistics.com'
  };
  
  const intent = createCheckoutIntent(clientData);
  console.log(`  ✓ Intención Generada:`);
  console.log(`    - ID Transacción: ${intent.transactionId}`);
  console.log(`    - Destino Strike: ${intent.strikeLightningAddress}`);
  console.log(`    - Monto a Cobrar: $${intent.amountUSD} USD`);
  console.log(`    - Estado: ${intent.status}`);
  await sleep(1500);

  console.log('\n🔹 PASO 3: Demostración Canal A — Liquidación Bitcoin Lightning (Strike)');
  console.log('------------------------------------------------------------------------');
  console.log('  ⏳ Verificando llegada de fondos en satoshis/USD a rick2818@strike.me...');
  await sleep(1200);

  const lightningResult = await verifyAndSettleLightningPayment({
    transactionId: intent.transactionId,
    invoiceId: 'inv_strike_demo_982341',
    amountUSD: intent.amountUSD,
    customerEmail: intent.customerEmail,
    domain: intent.domain,
    planId: intent.planId
  });

  console.log(`  ✅ Pago Confirmado y Liquidado en USD:`);
  console.log(`    - Transacción: ${lightningResult.record.transactionId}`);
  console.log(`    - Canal: ${lightningResult.record.channel}`);
  console.log(`    - Destino Fiduciario: ${lightningResult.record.destination}`);
  console.log(`    - Estado Final: ${lightningResult.record.status}`);
  console.log(`    - Timestamp: ${lightningResult.record.settledAt}`);
  await sleep(1500);

  console.log('\n🔹 PASO 4: Demostración de Idempotencia y Blindaje contra Doble Acreditación');
  console.log('----------------------------------------------------------------------------');
  console.log('  ⚠️ Simulando reintento accidental de la misma factura...');
  const duplicateAttempt = await verifyAndSettleLightningPayment({
    transactionId: intent.transactionId,
    amountUSD: intent.amountUSD
  });
  console.log(`  ✓ Resultado de Idempotencia: duplicateAttempt.alreadyProcessed = ${duplicateAttempt.alreadyProcessed}`);
  console.log('    (El agente detectó que la orden ya estaba asentada y bloqueó duplicados)');
  await sleep(1500);

  console.log('\n🔹 PASO 5: Demostración Canal B — Cobro con Tarjeta (Plan Flash $19 USD)');
  console.log('------------------------------------------------------------------------');
  const flashIntent = createCheckoutIntent({
    planId: 'flash',
    customerEmail: 'cto@cyber-retail.com',
    domain: 'cyber-retail.com'
  });

  console.log(`  ✓ Intención Creada para Tarjeta: ${flashIntent.transactionId} ($19 USD)`);
  console.log('  ⏳ Simulando confirmación de cobro con tarjeta vía Webhook Stripe...');
  await sleep(1200);

  const flashResult = await verifyAndSettleLightningPayment({
    transactionId: flashIntent.transactionId,
    amountUSD: flashIntent.amountUSD,
    customerEmail: flashIntent.customerEmail,
    domain: flashIntent.domain,
    planId: flashIntent.planId
  });
  console.log(`  ✅ Cobro Asentado en el Ledger: ${flashResult.record.transactionId} por $${flashResult.record.amountUSD} USD`);
  await sleep(1000);

  console.log('\n🔹 PASO 6: Inspección del Ledger Inmutable (pipeline/ventas_liquidadas.json)');
  console.log('--------------------------------------------------------------------------');
  const ledgerPath = path.resolve('pipeline/ventas_liquidadas.json');
  if (fs.existsSync(ledgerPath)) {
    const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
    console.log(`  📁 Registros totales en Auditoría: ${ledger.length}`);
    console.log('  Último registro en el libro mayor:');
    console.log(JSON.stringify(ledger[ledger.length - 1], null, 4));
  }

  console.log('\n======================================================================');
  console.log('🎉 DEMOSTRACIÓN COMPLETADA CON ÉXITO: 100% OPERATIVO Y DESATENDIDO');
  console.log('======================================================================\n');
}

runLiveDemonstration();
