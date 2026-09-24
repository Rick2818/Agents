import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Escenas en Español con la voz ejecutiva 'em_alex' y sincronización de timeframes exacta
const SCENES_ES = [
  { id: 1, delay: 3.2, text: "Medianoche. Un gerente general abre su C-R-M y encuentra ciento veintiocho consultas de clientes sin responder." },
  { id: 2, delay: 10.6, text: "Clientes esperando más de cuatro horas en WhatsApp y la web. Ventas de alto valor perdiéndose a cada minuto." },
  { id: 3, delay: 20.6, text: "Los prospectos rebotan entre ventas y operaciones, provocando una fuga devastadora de mil ochocientos cincuenta dólares por semana." },
  { id: 4, delay: 30.6, text: "Contratar más personal añade cuarenta mil dólares anuales en nómina. No hacer nada quema casi cien mil dólares." },
  { id: 5, delay: 40.6, text: "La decisión: desplegar el agente autónomo Sentinel de BolTech. En sesenta segundos está operando en la nube." },
  { id: 6, delay: 50.6, text: "A la mañana siguiente. El agente responde consultas calificadas en ocho segundos, entregando cotizaciones al instante." },
  { id: 7, delay: 60.6, text: "Se cierra y cobra un contrato Enterprise de cuatrocientos noventa dólares vía Stripe, con cero nómina humana." },
  { id: 8, delay: 70.6, text: "En treinta días: ciento ochenta y cuatro por ciento de retorno de inversión, sesenta por ciento de cierre y treinta y cinco horas ahorradas por semana." },
  { id: 9, delay: 81.0, text: "BolTech Group. Respaldado por nuestra garantía incondicional de siete días. Visita boltech guión group punto vercel punto app hoy mismo." }
];

// Escenas en Inglés con la voz ejecutiva 'am_adam' y sincronización idéntica (90s)
const SCENES_EN = [
  { id: 1, delay: 3.2, text: "Midnight. A General Manager opens the CRM and finds one hundred twenty-eight unaddressed customer inquiries." },
  { id: 2, delay: 10.6, text: "Customers waiting over four hours on WhatsApp and the web. High-ticket revenue slipping away every single minute." },
  { id: 3, delay: 20.6, text: "Leads bounce between sales and operations, causing a devastating eighteen hundred and fifty dollars per week revenue bleed." },
  { id: 4, delay: 30.6, text: "Hiring additional staff adds forty thousand dollars in annual payroll. Doing nothing burns nearly one hundred thousand dollars." },
  { id: 5, delay: 40.6, text: "The decision: deploy BolTech's autonomous Sentinel agent. Live in the cloud in under sixty seconds." },
  { id: 6, delay: 50.6, text: "Next morning: the agent responds to qualified inquiries in eight seconds, delivering precision quotes instantly." },
  { id: 7, delay: 60.6, text: "A four hundred and ninety dollar Enterprise contract is closed and paid via Stripe, with zero human payroll." },
  { id: 8, delay: 70.6, text: "In thirty days: one hundred eighty-four percent ROI, sixty percent close rate, and thirty-five hours saved per week." },
  { id: 9, delay: 81.0, text: "BolTech Group. Backed by our unconditional seven-day guarantee. Visit boltech dash group dot vercel dot app today." }
];

const workDirEs = path.resolve('video-exec/audio_parts_es');
const workDirEn = path.resolve('video-exec/audio_parts_en');
if (!fs.existsSync(workDirEs)) fs.mkdirSync(workDirEs, { recursive: true });
if (!fs.existsSync(workDirEn)) fs.mkdirSync(workDirEn, { recursive: true });

const bgMusic = path.resolve('video-exec/audio_parts/ambient_bed.wav');
const sourceVideo = path.resolve('video-exec/gerente-bottleneck/gerente_bottleneck_agente.mp4');
const targetVideoEs = path.resolve('assets/videos/gerente_bottleneck_agente_es.mp4');
const targetVideoEn = path.resolve('assets/videos/gerente_bottleneck_agente_en.mp4');
const copyMaster = path.resolve('assets/videos/gerente_bottleneck_agente.mp4');

// ==========================================
// 1. PROCESAMIENTO ESPAÑOL (ES)
// ==========================================
console.log('🎙️ [AUDIO ENGINE - ES]: Verificando/generando locución en español con voz em_alex...');
for (const scene of SCENES_ES) {
  const outFile = path.join(workDirEs, `scene_${scene.id}_es.wav`);
  if (!fs.existsSync(outFile)) {
    console.log(`🎙️ Generando Escena ES ${scene.id} (Delay: ${scene.delay}s)...`);
    const cmd = `npx hyperframes@0.8.68 tts "${scene.text}" -v em_alex -l es -o "${outFile}"`;
    execSync(cmd, { stdio: 'inherit' });
  }
}

const inputsEs = ['-i', bgMusic];
const filterPartsEs = ['[0:a]volume=0.22[bg]'];
const mixInputsEs = ['[bg]'];

SCENES_ES.forEach((scene, idx) => {
  const file = path.join(workDirEs, `scene_${scene.id}_es.wav`);
  inputsEs.push('-i', file);
  const inIdx = idx + 1;
  const delayMs = Math.round(scene.delay * 1000);
  filterPartsEs.push(`[${inIdx}:a]adelay=${delayMs}|${delayMs},volume=1.6[v${scene.id}]`);
  mixInputsEs.push(`[v${scene.id}]`);
});

const filterComplexEs = `${filterPartsEs.join(';')};${mixInputsEs.join('')}amix=inputs=${SCENES_ES.length + 1}:dropout_transition=0:normalize=0[out]`;
const finalAudioEs = path.join(workDirEs, 'final_narration_es_90s.wav');

console.log('🎛️ [AUDIO MIXER - ES]: Mezclando locución española con pista ambiental...');
const mixCmdEs = `ffmpeg -y ${inputsEs.join(' ')} -filter_complex "${filterComplexEs}" -map "[out]" -t 90 "${finalAudioEs}"`;
execSync(mixCmdEs, { stdio: 'inherit' });

console.log('🎬 [VIDEO COMPOSITOR - ES]: Ensamblando video 2 maestro en Español (90s)...');
const mergeCmdEs = `ffmpeg -y -i "${sourceVideo}" -i "${finalAudioEs}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest "${targetVideoEs}"`;
execSync(mergeCmdEs, { stdio: 'inherit' });
fs.copyFileSync(targetVideoEs, copyMaster);

// ==========================================
// 2. PROCESAMIENTO INGLÉS (EN)
// ==========================================
console.log('\n🎙️ [AUDIO ENGINE - EN]: Generando locución ejecutiva en inglés con voz am_adam...');
for (const scene of SCENES_EN) {
  const outFile = path.join(workDirEn, `scene_${scene.id}_en.wav`);
  if (!fs.existsSync(outFile)) {
    console.log(`🎙️ Generando Escena EN ${scene.id} (Delay: ${scene.delay}s)...`);
    const cmd = `npx hyperframes@0.8.68 tts "${scene.text}" -v am_adam -l en-us -o "${outFile}"`;
    execSync(cmd, { stdio: 'inherit' });
  }
}

const inputsEn = ['-i', bgMusic];
const filterPartsEn = ['[0:a]volume=0.22[bg]'];
const mixInputsEn = ['[bg]'];

SCENES_EN.forEach((scene, idx) => {
  const file = path.join(workDirEn, `scene_${scene.id}_en.wav`);
  inputsEn.push('-i', file);
  const inIdx = idx + 1;
  const delayMs = Math.round(scene.delay * 1000);
  filterPartsEn.push(`[${inIdx}:a]adelay=${delayMs}|${delayMs},volume=1.6[v${scene.id}]`);
  mixInputsEn.push(`[v${scene.id}]`);
});

const filterComplexEn = `${filterPartsEn.join(';')};${mixInputsEn.join('')}amix=inputs=${SCENES_EN.length + 1}:dropout_transition=0:normalize=0[out]`;
const finalAudioEn = path.join(workDirEn, 'final_narration_en_90s.wav');

console.log('🎛️ [AUDIO MIXER - EN]: Mezclando locución en inglés con pista ambiental...');
const mixCmdEn = `ffmpeg -y ${inputsEn.join(' ')} -filter_complex "${filterComplexEn}" -map "[out]" -t 90 "${finalAudioEn}"`;
execSync(mixCmdEn, { stdio: 'inherit' });

console.log('🎬 [VIDEO COMPOSITOR - EN]: Ensamblando video 2 maestro en Inglés (90s)...');
const mergeCmdEn = `ffmpeg -y -i "${sourceVideo}" -i "${finalAudioEn}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest "${targetVideoEn}"`;
execSync(mergeCmdEn, { stdio: 'inherit' });

console.log('\n✅ ¡PROCESO COMPLETADO AL 100%! Ambos videos (ES y EN) sincronizados a 90 segundos con calidad H.264/AAC.');
