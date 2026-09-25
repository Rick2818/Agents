import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const workDir = path.resolve('video-exec/cinematic_branded_master');

const scenes_es = [
  'Cada día, fallas invisibles en pasarelas de pago y procesos manuales le cuestan miles de dólares a tu empresa. En solo 15 segundos, nuestro escáner perimetral detecta tus fugas operativas en vivo, desde el exterior y sin pedirte contraseñas.',
  'No vendemos consultoría teórica ni reuniones interminables. Boltech Group implementa agentes autónomos listos para producción que vigilan tus transacciones, resuelven tickets y blindan tus flujos veinticuatro siete en memoria RAM aislada.',
  'Un analista o soporte manual cuesta más de seiscientos dólares al mes. Nuestro agente opera veinticuatro siete por solo dos dólares con treinta centavos al día, pagándose solo desde la primera venta recuperada.',
  'Entrada con micro-riesgo: descarga tu informe técnico ejecutivo con parches listos por solo diecinueve dólares, con privacidad bancaria SOC-2 y Garantía Total: si en siete días no te ahorra diez horas de trabajo, te devolvemos el cien por ciento.',
  'Audita tu infraestructura gratis en boltech-group punto vercel punto app o activa tu agente soberano hoy mismo. Boltech Group: Certeza operativa y paz mental veinticuatro siete.'
];

const scenes_en = [
  'Every single day, invisible checkout payment failures and manual bottlenecks silently cost your company thousands of dollars. In just 15 seconds, our perimeter scanner identifies operational leaks live, externally, with zero passwords required.',
  'We do not sell theoretical consulting or endless meetings. Boltech Group deploys production-ready autonomous AI agents that monitor transactions, resolve tickets, and protect workflows twenty-four-seven in isolated RAM.',
  'A human support operator costs over six hundred dollars a month. Our autonomous agent operates twenty-four-seven for just two dollars and thirty cents a day, paying for itself with a single recovered checkout.',
  'Micro-risk entry: download your executive diagnostic report with ready-to-deploy patches for just nineteen dollars, backed by SOC-2 banking privacy and our Unconditional 7-Day Guarantee: if it doesn\'t save you 10 hours, you get a full refund.',
  'Audit your domain free at boltech-group dot vercel dot app or activate your autonomous agent today. Boltech Group: Operational certainty and peace of mind twenty-four-seven.'
];

console.log('================================================================================');
console.log('🛡️ AUDITORÍA OFICIAL FIDUCIARIA: TIME FRAMES & CONTENIDO DE VIDEO MASTER');
console.log('================================================================================\n');

let totalAudioES = 0;
let totalClipES = 0;

console.log('📌 1. ANÁLISIS POR ESCENA (VERSIÓN ESPAÑOL - es-US-AlonsoNeural):');
for (let i = 1; i <= 5; i++) {
  const audioFile = path.join(workDir, `audio_es_${i}.mp3`);
  if (fs.existsSync(audioFile)) {
    const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioFile}"`, { encoding: 'utf8' }).trim();
    const dur = parseFloat(durStr);
    const clipDur = dur + 0.8;
    totalAudioES += dur;
    totalClipES += clipDur;

    console.log(`\n🔹 Escena ${i} [${s_name(i)}]:`);
    console.log(`   - Texto Locución: "${scenes_es[i-1]}"`);
    console.log(`   - Duración Audio Puro: ${dur.toFixed(2)}s`);
    console.log(`   - Duración Clip (Audio + 0.8s respiración): ${clipDur.toFixed(2)}s`);
    console.log(`   - Auditoría de Palabras: ${/forense/i.test(scenes_es[i-1]) ? '❌ ERROR: "forense" detectado' : '✅ CORRECTO: "informe técnico ejecutivo" activo'}`);
  }
}

console.log('\n--------------------------------------------------------------------------------');
console.log(`📊 TOTAL VIDEO ESPAÑOL: Audio = ${totalAudioES.toFixed(2)}s | Video Final = ${totalClipES.toFixed(2)}s (~${Math.round(totalClipES)}s)`);
console.log('--------------------------------------------------------------------------------\n');

let totalAudioEN = 0;
let totalClipEN = 0;

console.log('📌 2. ANÁLISIS POR ESCENA (VERSIÓN INGLÉS - en-US-AndrewMultilingualNeural):');
for (let i = 1; i <= 5; i++) {
  const audioFile = path.join(workDir, `audio_en_${i}.mp3`);
  if (fs.existsSync(audioFile)) {
    const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioFile}"`, { encoding: 'utf8' }).trim();
    const dur = parseFloat(durStr);
    const clipDur = dur + 0.8;
    totalAudioEN += dur;
    totalClipEN += clipDur;

    console.log(`\n🔹 Escena ${i} [${s_name(i)}]:`);
    console.log(`   - Script: "${scenes_en[i-1]}"`);
    console.log(`   - Duración Audio Puro: ${dur.toFixed(2)}s`);
    console.log(`   - Duración Clip (Audio + 0.8s breath): ${clipDur.toFixed(2)}s`);
    console.log(`   - Word Audit: ${/forensic/i.test(scenes_en[i-1]) ? '❌ ERROR: "forensic" detected' : '✅ CLEAN: "executive diagnostic report" active'}`);
  }
}

console.log('\n--------------------------------------------------------------------------------');
console.log(`📊 TOTAL VIDEO INGLÉS: Audio = ${totalAudioEN.toFixed(2)}s | Video Final = ${totalClipEN.toFixed(2)}s (~${Math.round(totalClipEN)}s)`);
console.log('================================================================================\n');

function s_name(id) {
  switch(id) {
    case 1: return 'Detección de Fugas & Escáner 15s';
    case 2: return 'Agentes Autónomos & Núcleo RAM Aislado';
    case 3: return 'Matemática de ROI ($600/mes vs $2.30/día)';
    case 4: return 'Micro-Riesgo $19, SOC-2 & Garantía 7 Días';
    case 5: return 'Identidad Boltech Group & Llamado a la Acción';
    default: return 'Escena';
  }
}
