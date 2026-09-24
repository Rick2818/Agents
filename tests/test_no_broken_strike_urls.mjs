import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

test('Zero Broken Strike Web URLs Guard: Verifica que ninguna URL use strike.me como enlace HTTP roto', () => {
  const rootDir = path.resolve('.');
  const filesToCheck = [
    'index.html',
    'lib/billing_settlement_sentinel.js',
    'api/checkout.js',
    'api/verify-lightning.js',
    'scripts/outbound/autonomous_hunter.mjs',
    'scripts/outbound/autonomous_opportunity_engine.mjs',
    'scripts/outbound/poll_explee_hot_leads.mjs',
    'scripts/outbound/run_cron_hunter.mjs'
  ];

  const brokenUrlRegex = /https:\/\/strike\.me\/[a-zA-Z0-9_-]+/g;

  for (const file of filesToCheck) {
    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) continue;
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const matches = content.match(brokenUrlRegex);
    
    assert.equal(
      matches,
      null,
      `[SECURITY/UX INVARIANT VIOLATION] Se detectó enlace HTTP roto '${matches ? matches.join(', ') : ''}' en ${file}. Debe usarse 'rick2818@strike.me' o 'lightning:rick2818@strike.me' o la URL de soluciones de Boltech Group.`
    );
  }
});
