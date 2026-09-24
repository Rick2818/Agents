import { test } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

test('Boltech Payments MCP Server: Initialises, lists tools and executes payments_status cleanly', async () => {
  const serverPath = path.resolve('mcp/boltech-payments-mcp.mjs');
  
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    env: {
      ...process.env,
      STRIKE_API_KEY: 'test_strike_key',
      WOMPI_PRIVATE_KEY: 'prv_test_key',
      WOMPI_ENV: 'sandbox',
      USD_COP_RATE: '4000'
    }
  });

  const client = new Client(
    { name: 'boltech-test-client', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);

  // 1. List tools
  const toolsResult = await client.listTools();
  assert.ok(toolsResult && toolsResult.tools, 'Tools list must be returned');
  const toolNames = toolsResult.tools.map(t => t.name);

  assert.ok(toolNames.includes('payments_status'), 'Must have payments_status tool');
  assert.ok(toolNames.includes('strike_create_invoice'), 'Must have strike_create_invoice tool');
  assert.ok(toolNames.includes('strike_get_invoice'), 'Must have strike_get_invoice tool');
  assert.ok(toolNames.includes('wompi_create_payment_link'), 'Must have wompi_create_payment_link tool');
  assert.ok(toolNames.includes('wompi_get_transaction'), 'Must have wompi_get_transaction tool');

  // 2. Call payments_status tool
  const statusResult = await client.callTool({
    name: 'payments_status',
    arguments: {}
  });

  assert.ok(statusResult && statusResult.content, 'Status result content must exist');
  const parsedStatus = JSON.parse(statusResult.content[0].text);
  assert.strictEqual(parsedStatus.strike, true, 'Strike must be active');
  assert.strictEqual(parsedStatus.wompi, true, 'Wompi must be active');
  assert.strictEqual(parsedStatus.wompi_env, 'sandbox', 'Wompi env must be sandbox');
  assert.strictEqual(parsedStatus.usd_cop_rate_set, true, 'USD COP rate must be set');

  await client.close();
});
