import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Bilingual i18n DOM IDs and dictionary completeness', () => {
  const htmlPath = path.resolve('index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Extract all safeSet IDs
  const safeSetMatches = [...html.matchAll(/safeSet\('([^']+)'/g)].map(m => m[1]);
  assert.ok(safeSetMatches.length > 50, 'Should have at least 50 localized elements');

  const missingFromHtml = [];
  for (const id of safeSetMatches) {
    if (!html.includes(`id="${id}"`)) {
      missingFromHtml.push(id);
    }
  }

  assert.deepStrictEqual(missingFromHtml, [], `All safeSet IDs must exist in HTML: ${missingFromHtml.join(', ')}`);

  // Verify English and Spanish Custom Agent Video files exist
  const vidEs = path.resolve('assets/videos/gerente_bottleneck_agente_es.mp4');
  const vidEn = path.resolve('assets/videos/gerente_bottleneck_agente_en.mp4');

  assert.ok(fs.existsSync(vidEs), 'Spanish Custom Agents MP4 must exist');
  assert.ok(fs.existsSync(vidEn), 'English Custom Agents MP4 must exist');
});
