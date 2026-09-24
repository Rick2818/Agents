import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {
  BOLTECH_PRICING_CATALOG,
  createCheckoutIntent,
  createStripeCheckoutSession,
  verifyAndSettleLightningPayment,
  isAlreadySettled
} from '../lib/billing_settlement_sentinel.js';

test('1. Catálogo de Precios Fiduciario Boltech Group cumple con las matrices del CFO', () => {
  assert.equal(BOLTECH_PRICING_CATALOG.flash.amountUSD, 19, 'Plan Flash debe ser exactamente $19 USD');
  assert.equal(BOLTECH_PRICING_CATALOG.pro.amountUSD, 69, 'Plan Pro debe ser exactamente $69 USD');
  assert.equal(BOLTECH_PRICING_CATALOG.enterprise.amountUSD, 490, 'Plan Enterprise debe ser exactamente $490 USD');
});

test('2. Generación de Intención de Cobro (createCheckoutIntent)', () => {
  const intent = createCheckoutIntent({
    planId: 'pro',
    customerEmail: 'ceo@techstartup.com',
    domain: 'techstartup.com'
  });

  assert.ok(intent.transactionId.startsWith('BOL-'), 'El ID de transacción debe comenzar con BOL-');
  assert.equal(intent.amountUSD, 69, 'El monto debe coincidir con $69 USD');
  assert.equal(intent.strikeLightningAddress, 'rick2818@strike.me', 'La dirección Lightning debe ser rick2818@strike.me');
  assert.equal(intent.status, 'PENDING_PAYMENT');
});

test('3. Sesión de Cobro Stripe (Terminal Directo y URLs Seguras)', async () => {
  const session = await createStripeCheckoutSession({
    planId: 'flash',
    customerEmail: 'cto@empresa.com',
    domain: 'empresa.com'
  });

  assert.ok(session.transactionId.startsWith('BOL-'), 'Debe generar transactionId');
  assert.equal(session.amountUSD, 19, 'Monto Flash debe ser 19 USD');
  assert.ok(session.mode === 'direct_modal_terminal' || session.mode === 'stripe_payment_link' || session.url, 'Modo de cobro válido');
});

test('4. Liquidación y Conciliación Inmutable de Pagos Bitcoin Lightning (Strike)', async () => {
  const txId = `BOL-TEST-${Date.now()}`;
  const result = await verifyAndSettleLightningPayment({
    transactionId: txId,
    amountUSD: 69,
    customerEmail: 'test-audit@boltech.group',
    domain: 'audit-domain.com',
    planId: 'pro'
  });

  assert.equal(result.isSettled, true, 'La transacción debe quedar liquidada');
  assert.equal(result.record.destination, 'rick2818@strike.me', 'Destino Strike fiduciario');
  assert.equal(isAlreadySettled(txId), true, 'isAlreadySettled debe devolver true para la tx liquidada');

  // Comprobar idempotencia ante reintentos
  const duplicate = await verifyAndSettleLightningPayment({
    transactionId: txId,
    amountUSD: 69
  });
  assert.equal(duplicate.alreadyProcessed, true, 'Debe prevenir doble liquidación por idempotencia');
});

test('5. Bucle Cognitivo ReAct (Reasoning + Acting + Observation) opera con traza completa', async () => {
  const { executeReActBillingLoop } = await import('../lib/billing_settlement_sentinel.js');
  
  const reactResult = await executeReActBillingLoop({
    eventType: 'NEW_CHECKOUT_INTENT',
    payload: {
      planId: 'pro',
      customerEmail: 'react-ceo@enterprise.com',
      domain: 'enterprise.com',
      channel: 'BITCOIN_LIGHTNING_STRIKE'
    }
  });

  assert.equal(reactResult.ok, true, 'El bucle ReAct debe concluir con éxito');
  assert.equal(reactResult.amountUSD, 69, 'Monto del plan Pro');
  assert.ok(Array.isArray(reactResult.reactTrace), 'Debe generar la traza ReAct');
  
  const stepTypes = reactResult.reactTrace.map(s => s.type);
  assert.ok(stepTypes.includes('Thought'), 'Debe contener pasos de Razonamiento (Thought)');
  assert.ok(stepTypes.includes('Action'), 'Debe contener pasos de Acción (Action)');
  assert.ok(stepTypes.includes('Observation'), 'Debe contener pasos de Observación (Observation)');
  assert.ok(stepTypes.includes('Final_Answer'), 'Debe contener la Respuesta Final (Final Answer)');
});
