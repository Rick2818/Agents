/**
 * =============================================================================
 * GENERADOR DE AUDIO Y VIDEO MASTER DE 5 ESCENAS CON FONÉTICA CALIBRADA
 * =============================================================================
 * Calibración fonética para pronunciación nativa perfecta en español e inglés:
 * - "Boltech Group" -> Pronunciación fonética exacta [Bóltek Group]
 * - "Custom Agents" -> Pronunciación fonética fluida [Kástom Éidents]
 * - "Unblock AI Shield" -> [An-blók Ei-Ai Shild]
 * - "Stripe" -> [Straip]
 * =============================================================================
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const WORK_DIR = path.resolve('video-exec/5scenes_audio');
if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR, { recursive: true });

const SCENES_DIR = path.resolve('assets', 'videos', 'scenes');
const OUTPUT_DIR = path.resolve('assets', 'videos');

// 1. Guiones fonéticos calibrados para Español (con pronunciación de marcas en inglés perfecto)
const SCENES_ES = [
  {
    id: 1,
    delay: 0.5,
    text: "En muchas empresas, los reportes operativos revelan cuellos de botella manuales que frenan el crecimiento y agotan a los equipos."
  },
  {
    id: 2,
    delay: 12.5,
    // Calibración fonética: "Bóltek Group" para que la voz en español pronuncie 'tech' en inglés
    text: "El equipo de Bóltek Group interviene con una solución definitiva: agentes autónomos listos para operar desde el primer día."
  },
  {
    id: 3,
    delay: 24.5,
    // Frase exacta en inglés pronunciada nítidamente
    text: "Custom Agents allow more efficiency in processes. Eliminamos la fricción, procesamos flujos repetitivos veinticuatro siete y multiplicamos la rentabilidad."
  },
  {
    id: 4,
    delay: 36.5,
    text: "El Director General sonríe con alivio. Un apretón de manos sella la alianza: software soberano que trabaja mientras tú descansas."
  },
  {
    id: 5,
    delay: 48.5,
    text: "Bóltek Group. Certeza operativa y retorno de inversión garantizado para empresas que no se detienen."
  }
];

// 2. Guiones en Inglés Nativo (Voz US Corporativa)
const SCENES_EN = [
  {
    id: 1,
    delay: 0.5,
    text: "Across modern enterprises, operational reports constantly expose manual bottlenecks that stall revenue and exhaust internal teams."
  },
  {
    id: 2,
    delay: 12.5,
    text: "Boltech Group steps in with a turnkey answer: autonomous AI agents engineered to execute flawlessly from day one."
  },
  {
    id: 3,
    delay: 24.5,
    text: "Custom Agents allow more efficiency in processes. We eradicate friction, automate critical workflows twenty-four-seven, and protect your bottom line."
  },
  {
    id: 4,
    delay: 36.5,
    text: "The General Manager smiles with confidence. A firm handshake seals the partnership: intelligent autonomous agents working around the clock."
  },
  {
    id: 5,
    delay: 48.5,
    text: "Boltech Group. Sovereign Enterprise AI Agents and twenty-four-seven operational peace of mind."
  }
];

async function generateVoiceClips() {
  console.log('🎙️ Generando locuciones con fonética calibrada...');

  // Generar clips en Español
  for (const s of SCENES_ES) {
    const outFile = path.join(WORK_DIR, `scene_${s.id}_es.wav`);
    console.log(`Generando Escena ${s.id} (ES)...`);
    const cmd = `npx hyperframes@0.8.62 tts "${s.text}" -o "${outFile}" --voice ef_dora --lang es`;
    execSync(cmd, { stdio: 'inherit' });
  }

  // Generar clips en Inglés
  for (const s of SCENES_EN) {
    const outFile = path.join(WORK_DIR, `scene_${s.id}_en.wav`);
    console.log(`Generando Escena ${s.id} (EN)...`);
    const cmd = `npx hyperframes@0.8.62 tts "${s.text}" -o "${outFile}" --voice am_adam --lang en-us`;
    execSync(cmd, { stdio: 'inherit' });
  }

  // Generar música de fondo ambiental elegante (60s)
  const bgMusic = path.join(WORK_DIR, 'ambient_bed_60s.wav');
  console.log('Generando colchón musical ambiental...');
  const synthCmd = `ffmpeg -y -f lavfi -i "sine=frequency=110:duration=60" -f lavfi -i "sine=frequency=220:duration=60" -f lavfi -i "sine=frequency=329.63:duration=60" -filter_complex "[0:a]volume=0.25[a0];[1:a]volume=0.15[a1];[2:a]volume=0.1[a2];[a0][a1][a2]amix=inputs=3,lowpass=f=800,volume=0.15,afade=t=in:ss=0:d=2,afade=t=out:st=57:d=3[out]" -map "[out]" "${bgMusic}"`;
  execSync(synthCmd, { stdio: 'inherit' });

  // Mezclar audio Español (60s)
  console.log('Mezclando audio en Español...');
  const inputsEs = ['-i', bgMusic];
  const filterPartsEs = ['[0:a]volume=0.25[bg]'];
  const mixInputsEs = ['[bg]'];

  SCENES_ES.forEach((scene, idx) => {
    const file = path.join(WORK_DIR, `scene_${scene.id}_es.wav`);
    inputsEs.push('-i', file);
    const inIdx = idx + 1;
    const delayMs = Math.round(scene.delay * 1000);
    filterPartsEs.push(`[${inIdx}:a]adelay=${delayMs}|${delayMs},volume=1.4[v${scene.id}]`);
    mixInputsEs.push(`[v${scene.id}]`);
  });

  const filterComplexEs = `${filterPartsEs.join(';')};${mixInputsEs.join('')}amix=inputs=${SCENES_ES.length + 1}:dropout_transition=0:normalize=0[out]`;
  const finalAudioEs = path.join(WORK_DIR, 'final_narration_es_60s.wav');
  const mixCmdEs = `ffmpeg -y ${inputsEs.join(' ')} -filter_complex "${filterComplexEs}" -map "[out]" -t 60 "${finalAudioEs}"`;
  execSync(mixCmdEs, { stdio: 'inherit' });

  // Mezclar audio Inglés (60s)
  console.log('Mezclando audio en Inglés...');
  const inputsEn = ['-i', bgMusic];
  const filterPartsEn = ['[0:a]volume=0.25[bg]'];
  const mixInputsEn = ['[bg]'];

  SCENES_EN.forEach((scene, idx) => {
    const file = path.join(WORK_DIR, `scene_${scene.id}_en.wav`);
    inputsEn.push('-i', file);
    const inIdx = idx + 1;
    const delayMs = Math.round(scene.delay * 1000);
    filterPartsEn.push(`[${inIdx}:a]adelay=${delayMs}|${delayMs},volume=1.4[v${scene.id}]`);
    mixInputsEn.push(`[v${scene.id}]`);
  });

  const filterComplexEn = `${filterPartsEn.join(';')};${mixInputsEn.join('')}amix=inputs=${SCENES_EN.length + 1}:dropout_transition=0:normalize=0[out]`;
  const finalAudioEn = path.join(WORK_DIR, 'final_narration_en_60s.wav');
  const mixCmdEn = `ffmpeg -y ${inputsEn.join(' ')} -filter_complex "${filterComplexEn}" -map "[out]" -t 60 "${finalAudioEn}"`;
  execSync(mixCmdEn, { stdio: 'inherit' });

  // Ensamblar videos finales con audio incrustado (60s exactos)
  const sConcat = path.resolve('assets/videos/scenes_concat.txt');

  const outEs = path.join(OUTPUT_DIR, 'boltech_corporate_5scenes_es.mp4');
  const outEn = path.join(OUTPUT_DIR, 'boltech_corporate_5scenes_en.mp4');

  console.log('Compilando Video Final ES con Audio...');
  const renderEsCmd = `ffmpeg -y -f concat -safe 0 -i "${sConcat.replace(/\\/g, '/')}" -i "${finalAudioEs.replace(/\\/g, '/')}" -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p" -c:v libx264 -r 25 -preset fast -crf 20 -c:a aac -b:a 192k -shortest -t 60 "${outEs.replace(/\\/g, '/')}"`;
  execSync(renderEsCmd, { stdio: 'inherit' });

  console.log('Compilando Video Final EN con Audio...');
  const renderEnCmd = `ffmpeg -y -f concat -safe 0 -i "${sConcat.replace(/\\/g, '/')}" -i "${finalAudioEn.replace(/\\/g, '/')}" -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p" -c:v libx264 -r 25 -preset fast -crf 20 -c:a aac -b:a 192k -shortest -t 60 "${outEn.replace(/\\/g, '/')}"`;
  execSync(renderEnCmd, { stdio: 'inherit' });

  console.log('✅ Ambos videos generados exitosamente con audio y fonética calibrada!');
}

generateVoiceClips().catch(console.error);
