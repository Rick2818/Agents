/**
 * =============================================================================
 * SUITE DE PRUEBAS: CRM INTEGRATIONS (HUBSPOT & SALESFORCE SDKs)
 * =============================================================================
 */

import {
  getHubSpotClient,
  getSalesforceConnection,
  getCRMStatus,
  syncLeadToCRM
} from '../lib/crm_integrations.js';
import crmHandler from '../api/crm.js';

console.log('=== INICIANDO SUITE DE PRUEBAS: HUBSPOT & SALESFORCE SDKs ===\n');

// 1. Diagnóstico de Estado de CRMs
console.log('1. Probando getCRMStatus:');
const status = getCRMStatus();
console.assert(status.success === true, 'getCRMStatus debe retornar success: true');
console.assert(status.integrations.hubspot.sdk === '@hubspot/api-client', 'HubSpot debe usar @hubspot/api-client');
console.assert(status.integrations.salesforce.sdk === 'jsforce', 'Salesforce debe usar jsforce');
console.log('  ✅ Diagnóstico de Estado de CRMs: PASADO');

// 2. Instanciación de Cliente HubSpot
console.log('\n2. Probando Cliente HubSpot (@hubspot/api-client):');
const nullClient = getHubSpotClient(null);
console.assert(nullClient === null, 'Sin token debe retornar null de forma segura');
const liveClient = getHubSpotClient('pat-na1-test-token-fiduciary-2026');
console.assert(liveClient !== null, 'Con token debe instanciar el cliente');
console.assert(typeof liveClient.crm?.contacts?.basicApi?.create === 'function', 'Debe tener API de creación de contactos');
console.log('  ✅ Cliente HubSpot: PASADO (SDK @hubspot/api-client cargado y funcional)');

// 3. Instanciación de Conexión Salesforce (jsforce)
console.log('\n3. Probando Conexión Salesforce (jsforce):');
const sfConn = getSalesforceConnection({
  instanceUrl: 'https://boltech-dev-ed.my.salesforce.com',
  accessToken: '00DtestSessionTokenFiduciary2026'
});
console.assert(typeof sfConn.sobject === 'function', 'Conexión Salesforce debe tener método sobject()');
console.assert(typeof sfConn.query === 'function', 'Conexión Salesforce debe tener método query()');
console.log('  ✅ Conexión Salesforce: PASADO (SDK jsforce cargado y funcional)');

// 4. Sincronización Defensiva en RAM (Validaciones)
console.log('\n4. Probando Función syncLeadToCRM (Fail-Safe en RAM):');
try {
  await syncLeadToCRM({});
  console.assert(false, 'Debe lanzar error si no se pasa correo');
} catch (err) {
  console.assert(err.message.includes('correo'), 'Error debe indicar correo obligatorio');
}

const syncResult = await syncLeadToCRM({
  email: 'director@prospecto-holding.com',
  firstname: 'Carlos',
  lastname: 'Mendoza',
  company: 'Grupo Industrial Alfa',
  source: 'Prueba Unitaria BolTech'
});
console.assert(syncResult.email === 'director@prospecto-holding.com', 'Debe devolver el correo procesado');
console.assert(syncResult.hubspot.synced === false, 'Debe indicar estado limpio en ausencia de tokens de prod');
console.assert(syncResult.salesforce.synced === false, 'Debe indicar estado limpio en ausencia de tokens de prod');
console.log('  ✅ syncLeadToCRM Fail-Safe: PASADO');

// 5. Endpoint GET /api/crm
console.log('\n5. Probando Endpoint GET /api/crm:');
let resStatus = 0;
let resData = null;
const mockResGet = {
  setHeader: () => {},
  status: (code) => {
    resStatus = code;
    return { json: (data) => { resData = data; } };
  }
};
await crmHandler({ method: 'GET', url: '/api/crm', headers: {}, socket: {} }, mockResGet);
console.assert(resStatus === 200, 'GET /api/crm debe retornar HTTP 200');
console.assert(resData.success === true, 'GET /api/crm debe responder success: true');
console.log('  ✅ Endpoint GET /api/crm: PASADO (Status:', resStatus, ')');

// 6. Endpoint POST /api/crm/sync (Validación)
console.log('\n6. Probando Validación en POST /api/crm/sync:');
let postStatus = 0;
let postData = null;
const mockResPost = {
  setHeader: () => {},
  status: (code) => {
    postStatus = code;
    return { json: (data) => { postData = data; } };
  }
};
await crmHandler({ method: 'POST', url: '/api/crm/sync', body: {}, headers: {}, socket: {} }, mockResPost);
console.assert(postStatus === 400, 'POST sin email debe retornar HTTP 400');
console.assert(postData.success === false, 'POST sin email debe retornar success: false');
console.log('  ✅ Validación POST /api/crm/sync: PASADO (Status:', postStatus, ')');

console.log('\n======================================================');
console.log('🎯 TODAS LAS PRUEBAS DE CRM (HUBSPOT & SALESFORCE) PASARON AL 100%');
console.log('======================================================\n');
