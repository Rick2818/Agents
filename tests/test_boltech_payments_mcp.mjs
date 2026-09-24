import { test } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

test('Boltech Payments MCP Server: Initialises, lists tools and executes full payment suite', async () => {
  const serverPath = path.resolve('mcp/boltech-payments-mcp.mjs');
  
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    env: {
      ...process.env,
      STRIKE_API_KEY: '',
      WOMPI_PRIVATE_KEY: '',
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
  assert.strictEqual(parsedStatus.strike, false);
  assert.strictEqual(parsedStatus.wompi, false);
  assert.strictEqual(parsedStatus.wompi_env, 'sandbox');
  assert.strictEqual(parsedStatus.usd_cop_rate_set, true);

  // 3. Test wompi_create_payment_link in sandbox simulation mode ($69.00 USD)
  const wompiLinkResult = await client.callTool({
    name: 'wompi_create_payment_link',
    arguments: {
      name: 'Plan Pro - Centinela 24/7',
      description: 'Activación Plan Pro $69 USD',
      amount_usd: 69,
      single_use: true
    }
  });
  assert.ok(wompiLinkResult && wompiLinkResult.content, 'Wompi link result must exist');
  const parsedWompi = JSON.parse(wompiLinkResult.content[0].text);
  assert.strictEqual(parsedWompi.amount_usd, 69);
  assert.strictEqual(parsedWompi.amount_cop, 276000);
  assert.strictEqual(parsedWompi.status, 'READY_FOR_COMMERCE');
  assert.ok(parsedWompi.url.includes('checkout.wompi.co'), 'Url must point to Wompi checkout');

  // 4. Test wompi_get_transaction in sandbox simulation mode
  const wompiTxResult = await client.callTool({
    name: 'wompi_get_transaction',
    arguments: {
      transaction_id: parsedWompi.link_id
    }
  });
  const parsedTx = JSON.parse(wompiTxResult.content[0].text);
  assert.strictEqual(parsedTx.status, 'APPROVED');
  assert.strictEqual(parsedTx.approved, true);
  assert.strictEqual(parsedTx.payment_method, 'NEQUI');

  // 5. Test strike_create_invoice in sandbox simulation mode ($69.00 USD)
  const strikeInvResult = await client.callTool({
    name: 'strike_create_invoice',
    arguments: {
      amount_usd: 69,
      description: 'Plan Pro $69 USD via Lightning'
    }
  });
  const parsedStrike = JSON.parse(strikeInvResult.content[0].text);
  assert.strictEqual(parsedStrike.amount_usd, 69);
  assert.strictEqual(parsedStrike.strike_lightning_address, 'rick2818@strike.me');
  assert.strictEqual(parsedStrike.status, 'READY_FOR_PAYMENT');

  // 6. Test strike_get_invoice
  const strikeGetResult = await client.callTool({
    name: 'strike_get_invoice',
    arguments: {
      invoice_id: parsedStrike.invoice_id
    }
  });
  const parsedStrikeStatus = JSON.parse(strikeGetResult.content[0].text);
  assert.strictEqual(parsedStrikeStatus.paid, true);
  assert.strictEqual(parsedStrikeStatus.state, 'PAID');

  await client.close();
});
