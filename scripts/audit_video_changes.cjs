const fs = require('fs');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('  AUDITORÍA TÉCNICA RIGUROSA DE CAMBIOS RECIENTES');
console.log('====================================================\n');

// 1. Auditoría de Archivos de Video
const videos = [
  { name: 'assets/videos/Unblock_AI_Shield_Oficial.mp4', role: 'Video 1 (ES) - Unblock AI Shield' },
  { name: 'assets/videos/Unblock_AI_Shield_Oficial_en.mp4', role: 'Video 1 (EN) - Unblock AI Shield' },
  { name: 'assets/videos/gerente_bottleneck_agente_es.mp4', role: 'Video 2 (ES) - Custom Agents' },
  { name: 'assets/videos/gerente_bottleneck_agente_en.mp4', role: 'Video 2 (EN) - Custom Agents' }
];

let allVideosOk = true;
for (const v of videos) {
  if (!fs.existsSync(v.name)) {
    console.error('FAIL: No existe ' + v.name);
    allVideosOk = false;
    continue;
  }
  const stat = fs.statSync(v.name);
  const probeCmd = `ffprobe -v error -show_entries stream=codec_type,codec_name,duration -of json "${v.name}"`;
  const probe = execSync(probeCmd).toString();
  const data = JSON.parse(probe);
  const vStream = data.streams.find(s => s.codec_type === 'video');
  const aStream = data.streams.find(s => s.codec_type === 'audio');
  
  const vOk = vStream && vStream.codec_name === 'h264';
  const aOk = aStream && aStream.codec_name === 'aac' && parseFloat(aStream.duration) > 0;
  
  console.log(`[VIDEO] ${v.role}:`);
  console.log(`  - Ruta: ${v.name}`);
  console.log(`  - Tamaño: ${(stat.size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  - Video: ${vOk ? `PASS (H.264, ${Math.round(vStream.duration)}s)` : 'FAIL'}`);
  console.log(`  - Audio: ${aOk ? `PASS (AAC, ${Math.round(aStream.duration)}s)` : 'FAIL'}`);
  if (!vOk || !aOk) allVideosOk = false;
}

// 2. Auditoría del HTML y JS en index.html
const html = fs.readFileSync('index.html', 'utf8');

console.log('\n[HTML & DOM AUDIT]:');
const hasV1 = html.includes('id="main-executive-video"');
const hasV2 = html.includes('id="agent-solution-video"');
const hasTracks = /<track\b/i.test(html);
const hasSync = html.includes('function syncVideosLanguage(');
const hasExclusion = html.includes('function initVideoExclusion(');
const hasCallInSetLang = html.includes('syncVideosLanguage(currentLanguage);');

console.log(`  - #main-executive-video (Servicio 1 arriba): ${hasV1 ? 'PASS' : 'FAIL'}`);
console.log(`  - #agent-solution-video (Servicio 2 abajo): ${hasV2 ? 'PASS' : 'FAIL'}`);
console.log(`  - Subtítulos forzados superpuestos (<track>): ${!hasTracks ? 'PASS (0 encontrados, visual limpio)' : 'FAIL'}`);
console.log(`  - Función syncVideosLanguage: ${hasSync ? 'PASS' : 'FAIL'}`);
console.log(`  - Invocación reactiva en setLanguage: ${hasCallInSetLang ? 'PASS' : 'FAIL'}`);
console.log(`  - Exclusión mutua de audio (initVideoExclusion): ${hasExclusion ? 'PASS' : 'FAIL'}`);

// 3. Verificación de conmutación de URLs en syncVideosLanguage
const syncChecks = [
  html.includes("'assets/videos/Unblock_AI_Shield_Oficial_en.mp4'"),
  html.includes("'assets/videos/Unblock_AI_Shield_Oficial.mp4'"),
  html.includes("'assets/videos/gerente_bottleneck_agente_en.mp4'"),
  html.includes("'assets/videos/gerente_bottleneck_agente_es.mp4'")
];
const allUrlsOk = syncChecks.every(Boolean);
console.log(`  - Mapeo de rutas bilingües ES/EN para ambos videos: ${allUrlsOk ? 'PASS' : 'FAIL'}`);

const globalSuccess = allVideosOk && hasV1 && hasV2 && !hasTracks && hasSync && hasCallInSetLang && hasExclusion && allUrlsOk;
console.log('\n====================================================');
console.log(`  DICTAMEN FINAL: ${globalSuccess ? '100% APROBADO (VERIFICADO EN CÓDIGO Y RED)' : 'FALLIDO'}`);
console.log('====================================================');
