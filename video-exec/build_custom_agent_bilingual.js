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

const workDir = path.resolve('video-exec/audio_parts_es');
if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });

console.log('🎙️ [AUDIO ENGINE]: Generando locución ejecutiva en español con voz premium em_alex...');

// Generar cada clip de voz con la voz ejecutiva 'em_alex'
for (const scene of SCENES_ES) {
  const outFile = path.join(workDir, `scene_${scene.id}_es.wav`);
  console.log(`🎙️ Generando Escena ${scene.id} (Delay: ${scene.delay}s)...`);
  const cmd = `npx hyperframes@0.8.68 tts "${scene.text}" -v em_alex -l es -o "${outFile}"`;
  execSync(cmd, { stdio: 'inherit' });
}

// Generar música de fondo ambiental
const bgMusic = path.resolve('video-exec/audio_parts/ambient_bed.wav');

// Construir filtro complejo de mezcla de audio en FFmpeg
const inputs = ['-i', bgMusic];
const filterParts = ['[0:a]volume=0.22[bg]'];
const mixInputs = ['[bg]'];

SCENES_ES.forEach((scene, idx) => {
  const file = path.join(workDir, `scene_${scene.id}_es.wav`);
  inputs.push('-i', file);
  const inIdx = idx + 1;
  const delayMs = Math.round(scene.delay * 1000);
  filterParts.push(`[${inIdx}:a]adelay=${delayMs}|${delayMs},volume=1.6[v${scene.id}]`);
  mixInputs.push(`[v${scene.id}]`);
});

const filterComplex = `${filterParts.join(';')};${mixInputs.join('')}amix=inputs=${SCENES_ES.length + 1}:dropout_transition=0:normalize=0[out]`;
const finalAudio = path.join(workDir, 'final_narration_es_90s.wav');

console.log('🎛️ [AUDIO MIXER]: Mezclando locución con pista ambiental y volumen balanceado...');
const mixCmd = `ffmpeg -y ${inputs.join(' ')} -filter_complex "${filterComplex}" -map "[out]" -t 90 "${finalAudio}"`;
execSync(mixCmd, { stdio: 'inherit' });

// Ensamblar con el video maestro
const sourceVideo = path.resolve('video-exec/gerente-bottleneck/gerente_bottleneck_agente.mp4');
const targetVideoEs = path.resolve('assets/videos/gerente_bottleneck_agente_es.mp4');
const targetVideoEn = path.resolve('assets/videos/gerente_bottleneck_agente_en.mp4');

console.log('🎬 [VIDEO COMPOSITOR]: Ensamblando video maestro con audio sincronizado...');
const mergeCmdEs = `ffmpeg -y -i "${sourceVideo}" -i "${finalAudio}" -c:v copy -c:a aac -b:a 192k -shortest "${targetVideoEs}"`;
execSync(mergeCmdEs, { stdio: 'inherit' });

// Actualizar también la versión en assets
const copyMaster = path.resolve('assets/videos/gerente_bottleneck_agente.mp4');
fs.copyFileSync(targetVideoEs, copyMaster);

console.log('✅ ¡PROCESO COMPLETADO! Video 2 actualizado con locución ejecutiva em_alex y timeframes sincronizados.');
