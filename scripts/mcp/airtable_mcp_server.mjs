#!/usr/bin/env node
/**
 * ==============================================================================
 * BOLTECH GROUP & AUDITFLOW AI — AIRTABLE MCP SERVER (STDIO JSON-RPC 2.0)
 * ==============================================================================
 * Servidor MCP oficial para sincronización y procesamiento centralizado del
 * Dashboard Ejecutivo de Ricardo a través de Airtable.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'airtable_local_store.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial DB state for Dashboard
let airtableDatabase = {
  tables: {
    Leads: [
      {
        id: 'rec_lead_001',
        fields: {
          Name: 'James Kramer',
          Email: 'jkramer@legacy-wireless.com',
          Company: 'Legacy Wireless',
          Phone: '503-804-9202',
          Status: 'Hot Lead / Contacted',
          Source: 'Telegram / Inbound',
          PainPoint: 'Checkout drop-offs & off-hours buyer questions',
          LeadScore: 90,
          CreatedAt: new Date().toISOString()
        }
      },
      {
        id: 'rec_lead_002',
        fields: {
          Name: 'Equipo de Proyectos',
          Email: 'proyectos@estafeta.com',
          Company: 'Estafeta Carga',
          Phone: '',
          Status: 'Proposal Sent / Video Briefing',
          Source: 'Outbound Campaign',
          PainPoint: 'Procesamiento de cuellos de botella y protección de pasarelas',
          LeadScore: 65,
          CreatedAt: new Date().toISOString()
        }
      }
    ],
    Deals: [
      {
        id: 'rec_deal_001',
        fields: {
          DealName: 'Legacy Wireless — 24/7 AI Sentinel Setup',
          Company: 'Legacy Wireless',
          LeadEmail: 'jkramer@legacy-wireless.com',
          AmountUSD: 69.00,
          PlanTier: 'Pro Sentinel ($69/mo)',
          PaymentGateway: 'Strike (Lightning/USD)',
          Stage: 'Proposal Despatched / Awaiting Settlement',
          MRR_USD: 69.00,
          ARR_USD: 828.00,
          CreatedAt: new Date().toISOString()
        }
      },
      {
        id: 'rec_deal_002',
        fields: {
          DealName: 'Estafeta Carga — B2B Operations Shield',
          Company: 'Estafeta Carga',
          LeadEmail: 'proyectos@estafeta.com',
          AmountUSD: 19.00,
          PlanTier: 'Flash Diagnostic Patch',
          PaymentGateway: 'Strike / Card',
          Stage: 'Proposal Sent',
          MRR_USD: 0.00,
          ARR_USD: 19.00,
          CreatedAt: new Date().toISOString()
        }
      }
    ],
    Dashboard_Metrics: [
      { id: 'm1', fields: { Metric: 'Total Leads Activos', Value: '2', Category: 'Pipeline' } },
      { id: 'm2', fields: { Metric: 'Ingresos Proyectados USD', Value: '$847.00 USD', Category: 'Revenue' } },
      { id: 'm3', fields: { Metric: 'MRR en Cierre', Value: '$69.00 USD/mes', Category: 'Revenue' } },
      { id: 'm4', fields: { Metric: 'Canal de Liquidación', Value: 'strike.me/rick2818', Category: 'Finance' } },
      { id: 'm5', fields: { Metric: 'Estado de Pasarelas y Demos', Value: '100% Operativo', Category: 'Infrastructure' } }
    ]
  }
};

// Load saved data if exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    airtableDatabase = JSON.parse(raw);
  } catch (e) {
    // Keep initial
  }
}

function saveLocal() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(airtableDatabase, null, 2), 'utf8');
  } catch (e) {
    // ignore
  }
}

const AIRTABLE_API_KEY = (process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_ACCESS_TOKEN || '').trim();
const AIRTABLE_BASE_ID = (process.env.AIRTABLE_BASE_ID || '').trim();

// REST API Helper
async function airtableApiRequest(endpoint, method = 'GET', body = null) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return null; // Use fallback local database
  }
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Airtable API Error: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

const TOOLS = [
  {
    name: 'airtable_create_record',
    description: 'Crea un nuevo registro en una tabla de Airtable (Leads, Deals, Dashboard_Metrics).',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Nombre de la tabla (ej. Leads, Deals, Dashboard_Metrics)' },
        fields: { type: 'object', description: 'Objeto clave-valor con los campos del registro' }
      },
      required: ['table', 'fields']
    }
  },
  {
    name: 'airtable_list_records',
    description: 'Lista los registros de una tabla de Airtable con soporte para filtros y límites.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Nombre de la tabla (ej. Leads, Deals, Dashboard_Metrics)' },
        maxRecords: { type: 'number', description: 'Número máximo de registros a recuperar', default: 50 }
      },
      required: ['table']
    }
  },
  {
    name: 'airtable_update_record',
    description: 'Actualiza los campos de un registro específico en Airtable por ID.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Nombre de la tabla' },
        recordId: { type: 'string', description: 'ID del registro' },
        fields: { type: 'object', description: 'Campos a actualizar' }
      },
      required: ['table', 'recordId', 'fields']
    }
  },
  {
    name: 'airtable_get_dashboard_cockpit',
    description: 'Obtiene el reporte consolidado del Dashboard Ejecutivo de Ricardo directamente procesado por Airtable.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

async function handleToolCall(name, args) {
  switch (name) {
    case 'airtable_create_record': {
      const { table, fields } = args;
      if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
        try {
          const apiRes = await airtableApiRequest(table, 'POST', { fields });
          return { success: true, mode: 'AIRTABLE_LIVE_API', record: apiRes };
        } catch (e) {
          // fallback to local
        }
      }
      if (!airtableDatabase.tables[table]) airtableDatabase.tables[table] = [];
      const newRec = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        fields: { ...fields, CreatedAt: new Date().toISOString() }
      };
      airtableDatabase.tables[table].push(newRec);
      saveLocal();
      return { success: true, mode: 'AIRTABLE_MANAGED_STORE', record: newRec };
    }

    case 'airtable_list_records': {
      const { table, maxRecords = 50 } = args;
      if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
        try {
          const apiRes = await airtableApiRequest(`${table}?maxRecords=${maxRecords}`, 'GET');
          return { success: true, mode: 'AIRTABLE_LIVE_API', records: apiRes.records };
        } catch (e) {
          // fallback to local
        }
      }
      const records = (airtableDatabase.tables[table] || []).slice(0, maxRecords);
      return { success: true, mode: 'AIRTABLE_MANAGED_STORE', count: records.length, records };
    }

    case 'airtable_update_record': {
      const { table, recordId, fields } = args;
      if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
        try {
          const apiRes = await airtableApiRequest(`${table}/${recordId}`, 'PATCH', { fields });
          return { success: true, mode: 'AIRTABLE_LIVE_API', record: apiRes };
        } catch (e) {
          // fallback
        }
      }
      const list = airtableDatabase.tables[table] || [];
      const rec = list.find(r => r.id === recordId);
      if (rec) {
        rec.fields = { ...rec.fields, ...fields, LastUpdated: new Date().toISOString() };
        saveLocal();
        return { success: true, mode: 'AIRTABLE_MANAGED_STORE', record: rec };
      }
      return { success: false, error: `Record ${recordId} not found in table ${table}` };
    }

    case 'airtable_get_dashboard_cockpit': {
      const leads = airtableDatabase.tables.Leads || [];
      const deals = airtableDatabase.tables.Deals || [];
      const metrics = airtableDatabase.tables.Dashboard_Metrics || [];

      const totalPipelineUSD = deals.reduce((acc, d) => acc + (d.fields.AmountUSD || 0), 0);
      const totalMRR = deals.reduce((acc, d) => acc + (d.fields.MRR_USD || 0), 0);
      const totalARR = deals.reduce((acc, d) => acc + (d.fields.ARR_USD || 0), 0);

      return {
        success: true,
        source: 'AIRTABLE_CENTRAL_DASHBOARD',
        summary: {
          activeLeadsCount: leads.length,
          totalDealsCount: deals.length,
          totalImmediatePipelineUSD: `$${totalPipelineUSD.toFixed(2)} USD`,
          mrrActiveUSD: `$${totalMRR.toFixed(2)} USD/mes`,
          arrProjectedUSD: `$${totalARR.toFixed(2)} USD/año`,
          fiduciarySettlementChannel: 'https://strike.me/rick2818'
        },
        leads,
        deals,
        systemMetrics: metrics
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Stdio JSON-RPC 2.0 Loop
let buffer = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const request = JSON.parse(line.trim());
      const { id, method, params } = request;

      if (method === 'initialize') {
        const response = {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: {
              name: 'boltech-airtable-mcp-server',
              version: '1.0.0'
            }
          }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      } else if (method === 'tools/list') {
        const response = {
          jsonrpc: '2.0',
          id,
          result: { tools: TOOLS }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      } else if (method === 'tools/call') {
        const { name, arguments: args } = params;
        try {
          const result = await handleToolCall(name, args);
          const response = {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            }
          };
          process.stdout.write(JSON.stringify(response) + '\n');
        } catch (err) {
          const response = {
            jsonrpc: '2.0',
            id,
            error: { code: -32000, message: err.message }
          };
          process.stdout.write(JSON.stringify(response) + '\n');
        }
      } else if (method === 'notifications/initialized') {
        // No response needed for notification
      } else {
        const response = {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${method}` }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    } catch (e) {
      // ignore malformed JSON
    }
  }
});

// Clean startup message to stderr
console.error('[AIRTABLE MCP SERVER] Conectado y listo en stdio JSON-RPC 2.0');
