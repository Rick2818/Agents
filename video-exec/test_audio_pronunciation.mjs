import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const testDir = 'video-exec/test_tts';
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

const tests = [
  {
    name: 'es_scene1_phonetic',
    lang: 'es',
    voice: 'ef_dora',
    text: 'Bóltek Grúp presenta: Kástom Éiyents.'
  },
  {
    name: 'es_scene1_alex',
    lang: 'es',
    voice: 'em_alex',
    text: 'Bóltek Grúp presenta: Kástom Éiyents.'
  },
  {
    name: 'en_scene1_adam',
    lang: 'en-us',
    voice: 'am_adam',
    text: 'Boltech-Group presents: Custom Agents.'
  },
  {
    name: 'en_scene1_heart',
    lang: 'en-us',
    voice: 'af_heart',
    text: 'Boltech-Group presents: Custom Agents.'
  },
  {
    name: 'en_scene1_michael',
    lang: 'en-us',
    voice: 'am_michael',
    text: 'Boltech-Group presents: Custom Agents.'
  }
];

for (const t of tests) {
  const outFile = path.join(testDir, `${t.name}.wav`);
  console.log(`Generating ${t.name}...`);
  const cmd = `npx hyperframes@0.8.68 tts "${t.text}" -v ${t.voice} -l ${t.lang} -o "${outFile}"`;
  execSync(cmd, { stdio: 'inherit' });
}
console.log('Done generating test audio!');
