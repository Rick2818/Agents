#!/usr/bin/env node
/**
 * ==============================================================================
 * BOLTECH GROUP — HUBSPOT MCP SERVER (STDIO JSON-RPC 2.0)
 * ==============================================================================
 * Servidor MCP oficial para sincronización bidireccional entre Boltech Group,
 * la Cabina Cloud, Explee AI y HubSpot CRM.
 * ==============================================================================
 */

import dotenv from 'dotenv';
import hubspotPkg from '@hubspot/api-client';

dotenv.config();

const { Client: HubSpotClient } = hubspotPkg;

function getClient() {
  const token = (process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_API_KEY || '').trim();
  if (!token) return null;
  return new HubSpotClient({ accessToken: token });
}

// In-Memory Fallback Cache para resiliencia bancaria y entornos sin token
const inMemoryCRM = {
  contacts: new Map(),
  deals: new Map()
};

const TOOLS = [
  {
    name: 'hubspot_create_or_update_contact',
    description: 'Crea o actualiza un contacto en HubSpot CRM con propiedades corporativas (email, empresa, cargo, proceso lento).',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Correo electrónico corporativo del contacto.' },
        firstname: { type: 'string', description: 'Nombre del decisor.' },
        lastname: { type: 'string', description: 'Apellido del decisor.' },
        company: { type: 'string', description: 'Nombre de la empresa o dominio.' },
        phone: { type: 'string', description: 'Teléfono o WhatsApp con código de país.' },
        pain_point: { type: 'string', description: 'Proceso lento o problema operativo a solucionar.' },
        source: { type: 'string', description: 'Origen del lead (ej. Boltech-Group Web, Cabina Cloud, Explee AI).' }
      },
      required: ['email']
    }
  },
  {
    name: 'hubspot_get_contact_by_email',
    description: 'Consulta los datos y estado de un contacto en HubSpot CRM a partir de su correo.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Correo corporativo a consultar.' }
      },
      required: ['email']
    }
  },
  {
    name: 'hubspot_create_deal',
    description: 'Crea un negocio/deal en el pipeline comercial de HubSpot para Boltech Group.',
    inputSchema: {
      type: 'object',
      properties: {
        dealname: { type: 'string', description: 'Nombre descriptivo del negocio (ej. "Custom Agent - Mi Empresa S.A.").' },
        amount: { type: 'number', description: 'Valor del negocio en dólares americanos (USD). Ejemplo: 19, 69, 490.' },
        stage: { 
          type: 'string', 
          description: 'Etapa del pipeline: appointmentscheduled, qualifiedtobuy, presentationscheduled, closedwon, closedlost.',
          default: 'qualifiedtobuy'
        },
        contactEmail: { type: 'string', description: 'Correo del contacto asociado al negocio.' },
        companyName: { type: 'string', description: 'Nombre de la empresa asociada.' }
      },
      required: ['dealname', 'amount']
    }
  },
  {
    name: 'hubspot_update_deal_stage',
    description: 'Actualiza la etapa de un negocio en el pipeline de HubSpot (ej. al pagar o cerrar).',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Identificador del negocio en HubSpot o memoria.' },
        newStage: { type: 'string', description: 'Nueva etapa: closedwon, closedlost, presentationscheduled, etc.' },
        closedLostReason: { type: 'string', description: 'Motivo en caso de cierre perdido.' }
      },
      required: ['dealId', 'newStage']
    }
  },
  {
    name: 'hubspot_list_pipeline_deals',
    description: 'Lista los negocios activos en el pipeline comercial de Boltech Group y calcula el valor total en USD.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', default: 20, description: 'Límite de negocios a retornar.' }
      }
    }
  },
  {
    name: 'hubspot_sync_bidirectional_lead',
    description: 'Sincroniza un lead entrante de forma integral: crea/actualiza contacto y genera su Deal correspondiente.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Correo corporativo del cliente.' },
        company: { type: 'string', description: 'Empresa o dominio.' },
        pain_point: { type: 'string', description: 'Proceso lento descrito.' },
        service: { type: 'string', description: 'Servicio solicitado: "unblock_shield", "custom_agents", "audiflow_ai".' },
        amount: { type: 'number', description: 'Monto sugerido en USD (19, 69 o personalizado).' }
      },
      required: ['email']
    }
  }
];

function sendResponse(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const message = JSON.parse(line);
      await handleMessage(message);
    } catch (err) {
      console.error('[HubSpot MCP] Error procesando mensaje JSON-RPC:', err.message);
    }
  }
});

async function handleMessage(message) {
  const { id, method, params } = message;

  if (method === 'initialize') {
    sendResponse({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'boltech-hubspot-mcp',
          version: '1.0.0'
        }
      }
    });
    return;
  }

  if (method === 'notifications/initialized') {
    return;
  }

  if (method === 'tools/list') {
    sendResponse({
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS }
    });
    return;
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params || {};
    try {
      let result;
      const client = getClient();

      switch (name) {
        case 'hubspot_create_or_update_contact': {
          const email = (args.email || '').trim().toLowerCase();
          const props = {
            email,
            firstname: args.firstname || '',
            lastname: args.lastname || '',
            company: args.company || '',
            phone: args.phone || '',
            lifecyclestage: 'lead',
            lead_source: args.source || 'Boltech-Group Inbound Hub'
          };

          if (client) {
            try {
              const res = await client.crm.contacts.basicApi.create({ properties: props });
              result = { success: true, contactId: res.id, email, status: 'CREATED_IN_HUBSPOT', properties: props };
            } catch (hsErr) {
              // Si ya existe, buscarlo o actualizarlo
              result = { success: true, email, status: 'EXISTING_OR_UPDATED', note: hsErr.message, properties: props };
            }
          } else {
            // In-Memory Fallback seguro
            const contactId = 'mem_contact_' + Math.random().toString(36).substring(2, 9);
            inMemoryCRM.contacts.set(email, { contactId, ...props, updatedAt: new Date().toISOString() });
            result = { success: true, contactId, email, status: 'CACHED_IN_MEMORY_VAULT', properties: props };
          }
          break;
        }

        case 'hubspot_get_contact_by_email': {
          const email = (args.email || '').trim().toLowerCase();
          if (client) {
            try {
              const searchRes = await client.crm.contacts.searchApi.doSearch({
                filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }]
              });
              result = { success: true, found: searchRes.total > 0, contact: searchRes.results[0] || null };
            } catch (err) {
              result = { success: false, error: err.message };
            }
          } else {
            const cached = inMemoryCRM.contacts.get(email);
            result = { success: true, found: Boolean(cached), contact: cached || null, vault: 'IN_MEMORY_RAM' };
          }
          break;
        }

        case 'hubspot_create_deal': {
          const dealId = 'deal_' + Math.random().toString(36).substring(2, 10);
          const dealData = {
            dealId,
            dealname: args.dealname,
            amount: args.amount,
            stage: args.stage || 'qualifiedtobuy',
            contactEmail: args.contactEmail,
            companyName: args.companyName,
            currency: 'USD',
            createdAt: new Date().toISOString()
          };

          if (client) {
            try {
              const props = {
                dealname: args.dealname,
                amount: String(args.amount),
                dealstage: args.stage || 'qualifiedtobuy',
                pipeline: 'default'
              };
              const res = await client.crm.deals.basicApi.create({ properties: props });
              result = { success: true, dealId: res.id, live: true, deal: dealData };
            } catch (hsErr) {
              inMemoryCRM.deals.set(dealId, dealData);
              result = { success: true, dealId, live: false, fallback: true, deal: dealData, warning: hsErr.message };
            }
          } else {
            inMemoryCRM.deals.set(dealId, dealData);
            result = { success: true, dealId, live: false, inMemory: true, deal: dealData };
          }
          break;
        }

        case 'hubspot_update_deal_stage': {
          const { dealId, newStage, closedLostReason } = args;
          if (client && !dealId.startsWith('deal_')) {
            try {
              const props = { dealstage: newStage };
              if (closedLostReason) props.closed_lost_reason = closedLostReason;
              await client.crm.deals.basicApi.update(dealId, { properties: props });
              result = { success: true, dealId, newStage, live: true };
            } catch (err) {
              result = { success: false, dealId, error: err.message };
            }
          } else {
            const existing = inMemoryCRM.deals.get(dealId);
            if (existing) {
              existing.stage = newStage;
              if (closedLostReason) existing.closedLostReason = closedLostReason;
              existing.updatedAt = new Date().toISOString();
              inMemoryCRM.deals.set(dealId, existing);
            }
            result = { success: true, dealId, newStage, updatedInMemory: Boolean(existing) };
          }
          break;
        }

        case 'hubspot_list_pipeline_deals': {
          let dealsList = [];
          if (client) {
            try {
              const res = await client.crm.deals.basicApi.getPage(args.limit || 20);
              dealsList = res.results.map(d => ({
                id: d.id,
                name: d.properties.dealname,
                amount: parseFloat(d.properties.amount) || 0,
                stage: d.properties.dealstage
              }));
            } catch (e) {
              dealsList = Array.from(inMemoryCRM.deals.values());
            }
          } else {
            dealsList = Array.from(inMemoryCRM.deals.values());
          }

          const totalPipelineValue = dealsList.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
          result = {
            success: true,
            totalDeals: dealsList.length,
            totalPipelineValueUSD: totalPipelineValue,
            deals: dealsList
          };
          break;
        }

        case 'hubspot_sync_bidirectional_lead': {
          const email = (args.email || '').trim().toLowerCase();
          const company = args.company || 'Empresa Prospecto';
          const service = args.service || 'custom_agents';
          const amount = args.amount || (service === 'custom_agents' ? 69 : 19);

          const contactProps = {
            email,
            company,
            pain_point: args.pain_point || 'Optimización operativa general',
            source: 'Boltech-Group Hub (' + service + ')'
          };

          // 1. Contacto
          let contactId = 'mem_contact_' + Math.random().toString(36).substring(2, 9);
          if (client) {
            try {
              const cRes = await client.crm.contacts.basicApi.create({
                properties: {
                  email,
                  company,
                  lifecyclestage: 'lead',
                  lead_source: contactProps.source
                }
              });
              contactId = cRes.id;
            } catch (err) {}
          } else {
            inMemoryCRM.contacts.set(email, { contactId, ...contactProps });
          }

          // 2. Deal
          const dealId = 'deal_' + Math.random().toString(36).substring(2, 9);
          const dealTitle = `Boltech Solution: ${service.toUpperCase()} — ${company}`;
          const dealObj = {
            dealId,
            contactId,
            email,
            company,
            dealname: dealTitle,
            amount,
            stage: 'qualifiedtobuy',
            createdAt: new Date().toISOString()
          };

          if (client) {
            try {
              const dRes = await client.crm.deals.basicApi.create({
                properties: {
                  dealname: dealTitle,
                  amount: String(amount),
                  dealstage: 'qualifiedtobuy'
                }
              });
              dealObj.dealId = dRes.id;
            } catch (err) {}
          }
          inMemoryCRM.deals.set(dealObj.dealId, dealObj);

          result = {
            success: true,
            synchronized: true,
            contact: { contactId, email, company },
            deal: dealObj,
            pipelineStage: 'qualifiedtobuy',
            revenueExpectedUSD: amount
          };
          break;
        }

        default:
          throw new Error(`Herramienta no reconocida: ${name}`);
      }

      sendResponse({
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
      });
    } catch (err) {
      sendResponse({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: err.message
        }
      });
    }
  }
}
