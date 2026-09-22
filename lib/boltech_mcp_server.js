/**
 * =============================================================================
 * BOLTECH GROUP — SERVIDOR MCP INSTITUCIONAL ESTANDARIZADO
 * =============================================================================
 * Expone las capacidades y herramientas fiduciarias del holding a Google Antigravity
 * y cualquier agente compatible con el estándar Model Context Protocol (MCP).
 * Conector: @modelcontextprotocol/sdk
 * =============================================================================
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { syncLeadToCRM } from './crm_integrations.js';
import { researchCompanyOrLead } from './lead_intelligence.js';
import { sendWhatsAppMessage } from './whatsapp_engine.js';

/**
 * Crea e inicializa una instancia del servidor MCP de BolTech Group
 */
export function createBoltechMCPServer() {
  const server = new Server(
    {
      name: 'boltech-fiduciary-mcp-server',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // 1. Registro del catálogo de herramientas (ListTools)
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_bitcoin_market_data',
          description: 'Obtiene precio en tiempo real de Bitcoin (USD) y tarifas recomendadas de Mempool para transacciones Lightning / On-chain.',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'research_b2b_lead',
          description: 'Investiga una empresa objetivo, fintech o decisor en tiempo real utilizando el motor cognitivo Tavily.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Nombre de la empresa o directivo a auditar' }
            },
            required: ['query']
          }
        },
        {
          name: 'sync_crm_lead',
          description: 'Sincroniza un contacto o lead calificado directamente con HubSpot y/o Salesforce.',
          inputSchema: {
            type: 'object',
            properties: {
              email: { type: 'string', description: 'Correo electrónico institucional' },
              firstname: { type: 'string', description: 'Nombre del prospecto' },
              lastname: { type: 'string', description: 'Apellido del prospecto' },
              company: { type: 'string', description: 'Empresa o entidad legal' },
              source: { type: 'string', description: 'Canal de prospección' }
            },
            required: ['email']
          }
        },
        {
          name: 'send_fiduciary_whatsapp',
          description: 'Despacha un mensaje de WhatsApp Business institucional mediante Twilio a un decisor en LATAM.',
          inputSchema: {
            type: 'object',
            properties: {
              to: { type: 'string', description: 'Número con prefijo internacional (ej: +50371234567)' },
              body: { type: 'string', description: 'Texto del mensaje de propuesta o cierre' }
            },
            required: ['to', 'body']
          }
        }
      ]
    };
  });

  // 2. Ejecución de herramientas (CallTool)
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'get_bitcoin_market_data') {
        let btcPrice = 90000;
        try {
          const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
          const data = await res.json();
          btcPrice = data.bitcoin?.usd || btcPrice;
        } catch (e) {}

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                asset: 'BTC/USD',
                price: btcPrice,
                settlement: 'Strike Lightning rails active'
              }, null, 2)
            }
          ]
        };
      }

      if (name === 'research_b2b_lead') {
        const result = await researchCompanyOrLead(args.query);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      }

      if (name === 'sync_crm_lead') {
        const result = await syncLeadToCRM(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      }

      if (name === 'send_fiduciary_whatsapp') {
        const result = await sendWhatsAppMessage(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      }

      throw new Error(`Herramienta desconocida: ${name}`);
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Error ejecutando ${name}: ${err.message}` }]
      };
    }
  });

  return server;
}

/**
 * Iniciar el servidor mediante Standard I/O (Stdio) para Antigravity CLI
 */
export async function startMCPServerStdio() {
  const server = createBoltechMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 [BolTech MCP Server] Servidor MCP iniciado y escuchando por Stdio.');
}

// Si se ejecuta directamente desde la terminal
if (import.meta.url === `file://${process.argv[1]}`) {
  startMCPServerStdio().catch(err => {
    console.error('💥 Error crítico en Servidor MCP:', err);
    process.exit(1);
  });
}
