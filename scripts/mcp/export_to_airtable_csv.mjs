/**
 * =============================================================================
 * EXPORTADOR DIRECTO DE TABLAS PARA AIRTABLE (CSV / JSON)
 * =============================================================================
 * Genera los archivos listos para importar o sincronizar en Airtable con un clic:
 * 1. data/airtable_leads.csv
 * 2. data/airtable_deals.csv
 * 3. data/airtable_metrics.csv
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve('data', 'airtable_local_store.json');
const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

function jsonToCsv(items) {
  if (!items || items.length === 0) return '';
  const first = items[0].fields;
  const headers = Object.keys(first);
  const rows = items.map(item => {
    return headers.map(h => {
      let val = item.fields[h] ?? '';
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

// 1. Leads
const leadsCsv = jsonToCsv(raw.tables.Leads);
fs.writeFileSync(path.resolve('data', 'airtable_leads.csv'), leadsCsv, 'utf8');

// 2. Deals
const dealsCsv = jsonToCsv(raw.tables.Deals);
fs.writeFileSync(path.resolve('data', 'airtable_deals.csv'), dealsCsv, 'utf8');

// 3. Metrics
const metricsCsv = jsonToCsv(raw.tables.Dashboard_Metrics);
fs.writeFileSync(path.resolve('data', 'airtable_metrics.csv'), metricsCsv, 'utf8');

console.log('✅ Archivos CSV para Airtable generados en /data:');
console.log(' - airtable_leads.csv');
console.log(' - airtable_deals.csv');
console.log(' - airtable_metrics.csv');
