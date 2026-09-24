import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const WORK_DIR = path.resolve('video-exec/custom_agents_clean_75s');
if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR, { recursive: true });

const OUTPUT_DIR = path.resolve('assets/videos');
const SCENES_DIR = path.resolve('assets/videos/scenes');

// =========================================================================
// 1. DEFINICIÓN DE ESCENAS & GUIONES (75 SEGUNDOS TOTAL - SIN SUBTÍTULOS)
// =========================================================================
const SCENES_ES = [
  {
    id: 1,
    duration: 6,
    delay: 0.2,
    text: "Boltech-Group presenta: Custom Agents.",
    bgImg: path.join(SCENES_DIR, 'scene1_intro_logo.jpg')
  },
  {
    id: 2,
    duration: 12,
    delay: 6.2,
    text: "Medianoche en la oficina. Un gerente general encuentra cientos de consultas sin responder y cotizaciones varadas en procedimientos ineficientes.",
    bgImg: path.join(SCENES_DIR, 'scene2_manager_bottleneck.jpg')
  },
  {
    id: 3,
    duration: 12,
    delay: 18.2,
    text: "Estos cuellos de botella queman mil ochocientos cincuenta dólares cada semana. Contratar más personal infla la nómina; no hacer nada destruye el flujo de caja.",
    bgImg: path.join(SCENES_DIR, 'scene3_team_overwhelmed.jpg')
  },
  {
    id: 4,
    duration: 15,
    delay: 30.2,
    text: "La solución: desplegar Custom Agents de Boltech-Group. En sesenta segundos, transforman procedimientos ineficientes en procesos automáticos de alta precisión.",
    bgImg: path.join(SCENES_DIR, 'scene4_agent_deployment.jpg')
  },
  {
    id: 5,
    duration: 15,
    delay: 45.2,
    text: "A la mañana siguiente: respuestas en ocho segundos, cotizaciones automáticas y contratos Enterprise cerrados y cobrados vía Stripe con cero nómina humana.",
    bgImg: path.join(SCENES_DIR, 'scene5_deal_closed_handshake.jpg')
  },
  {
    id: 6,
    duration: 15,
    delay: 60.2,
    text: "Erradica los cuellos de botella de tu empresa hoy mismo. Activa tu agente en la nube con nuestra garantía incondicional de siete días visitando boltech guión group punto vercel punto app. Boltech-Group.",
    bgImg: path.join(SCENES_DIR, 'scene6_outro_cta.jpg')
  }
];

const SCENES_EN = [
  {
    id: 1,
    duration: 6,
    delay: 0.2,
    text: "Boltech-Group presents: Custom Agents.",
    bgImg: path.join(SCENES_DIR, 'scene1_intro_logo.jpg')
  },
  {
    id: 2,
    duration: 12,
    delay: 6.2,
    text: "Midnight at the office. A general manager finds hundreds of unanswered customer chats and delayed quotes trapped in inefficient procedures.",
    bgImg: path.join(SCENES_DIR, 'scene2_manager_bottleneck.jpg')
  },
  {
    id: 3,
    duration: 12,
    delay: 18.2,
    text: "These bottlenecks bleed up to eighteen hundred and fifty dollars every week. Hiring more staff inflates payroll; doing nothing drains bottom-line cash flow.",
    bgImg: path.join(SCENES_DIR, 'scene3_team_overwhelmed.jpg')
  },
  {
    id: 4,
    duration: 15,
    delay: 30.2,
    text: "The solution: deploy Boltech-Group's Custom Agents. In sixty seconds, they turn inefficient procedures into high-efficiency automated workflows.",
    bgImg: path.join(SCENES_DIR, 'scene4_agent_deployment.jpg')
  },
  {
    id: 5,
    duration: 15,
    delay: 45.2,
    text: "Next morning: eight-second replies, instant precision quotes, and Enterprise deals closed and collected via Stripe with zero human payroll.",
    bgImg: path.join(SCENES_DIR, 'scene5_deal_closed_handshake.jpg')
  },
  {
    id: 6,
    duration: 15,
    delay: 60.2,
    text: "Eradicate office bottlenecks today. Launch your cloud agent with our unconditional seven-day guarantee at boltech dash group dot vercel dot app. Boltech-Group.",
    bgImg: path.join(SCENES_DIR, 'scene6_outro_cta.jpg')
  }
];

// =========================================================================
// 2. GENERACIÓN DE AUDIO & LOCUCIONES (ES & EN)
// =========================================================================
async function buildAudioTrack(scenes, lang, voice, outAudioPath) {
  console.log(`🎙️ [AUDIO]: Generando locuciones para ${lang.toUpperCase()} con voz ${voice}...`);
  const clipFiles = [];

  for (const s of scenes) {
    const clipFile = path.join(WORK_DIR, `scene_${s.id}_${lang}.wav`);
    if (!fs.existsSync(clipFile)) {
      console.log(`  - Sintetizando Escena ${s.id} (${lang})...`);
      const langFlag = lang === 'es' ? 'es' : 'en-us';
      const cmd = `npx hyperframes@0.8.68 tts "${s.text}" -v ${voice} -l ${langFlag} -o "${clipFile}"`;
      execSync(cmd, { stdio: 'inherit' });
    }
    clipFiles.push(clipFile);
  }

  const bgBed = path.join(WORK_DIR, 'ambient_bed_75s.wav');
  if (!fs.existsSync(bgBed)) {
    console.log('  - Sintetizando cama musical cinematográfica de 75s...');
    const synthCmd = `ffmpeg -y -f lavfi -i "sine=frequency=110:duration=75" -f lavfi -i "sine=frequency=220:duration=75" -f lavfi -i "sine=frequency=329.63:duration=75" -filter_complex "[0:a]volume=0.25[a0];[1:a]volume=0.15[a1];[2:a]volume=0.1[a2];[a0][a1][a2]amix=inputs=3,lowpass=f=800,volume=0.14,afade=t=in:ss=0:d=2,afade=t=out:st=72:d=3[out]" -map "[out]" "${bgBed}"`;
    execSync(synthCmd, { stdio: 'inherit' });
  }

  const inputs = ['-i', bgBed];
  const filterParts = ['[0:a]volume=0.22[bg]'];
  const mixInputs = ['[bg]'];

  scenes.forEach((s, idx) => {
    const file = clipFiles[idx];
    inputs.push('-i', file);
    const inIdx = idx + 1;
    const delayMs = Math.round(s.delay * 1000);
    filterParts.push(`[${inIdx}:a]adelay=${delayMs}|${delayMs},volume=1.6[v${s.id}]`);
    mixInputs.push(`[v${s.id}]`);
  });

  const filterComplex = `${filterParts.join(';')};${mixInputs.join('')}amix=inputs=${scenes.length + 1}:dropout_transition=0:normalize=0[out]`;
  console.log(`🎛️ [AUDIO MIXER]: Mezclando pista final de audio ${lang.toUpperCase()} (75s)...`);
  const mixCmd = `ffmpeg -y ${inputs.join(' ')} -filter_complex "${filterComplex}" -map "[out]" -t 75 "${outAudioPath}"`;
  execSync(mixCmd, { stdio: 'inherit' });
}

// =========================================================================
// 3. RENDERIZADO VISUAL CINEMATOGRÁFICO PURO (SIN SUBTÍTULOS)
// =========================================================================
async function renderCleanVisualVideo(scenes, outVideoPath) {
  console.log('🎬 [VIDEO ENGINE]: Compilando las 6 escenas fotográficas limpias en 1080p Ken Burns (Sin subtítulos)...');

  const inputs = [];
  const filterChains = [];
  const concatInputs = [];

  scenes.forEach((s, idx) => {
    inputs.push('-loop', '1', '-t', String(s.duration), '-i', s.bgImg.replace(/\\/g, '/'));
    const totalFrames = s.duration * 25;
    const vLabel = `v${idx}`;
    filterChains.push(
      `[${idx}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,` +
      `zoompan=z='min(zoom+0.0006,1.15)':d=${totalFrames}:s=1920x1080:fps=25[${vLabel}]`
    );
    concatInputs.push(`[${vLabel}]`);
  });

  const filterComplex = `${filterChains.join(';')};${concatInputs.join('')}concat=n=${scenes.length}:v=1:a=0[outv]`;

  const cmd = `ffmpeg -y ${inputs.join(' ')} -filter_complex "${filterComplex}" -map "[outv]" -c:v libx264 -pix_fmt yuv420p -r 25 -preset fast -crf 18 -t 75 "${outVideoPath}"`;
  execSync(cmd, { stdio: 'inherit' });
}

// =========================================================================
// 4. EJECUCIÓN PRINCIPAL MASTER
// =========================================================================
async function main() {
  console.log('================================================================');
  console.log('  PRODUCCIÓN MASTER: BOLTECH-GROUP CUSTOM AGENTS (CLEAN VISUAL)');
  console.log('================================================================\n');

  const audioEs = path.join(WORK_DIR, 'audio_es_75s.wav');
  const audioEn = path.join(WORK_DIR, 'audio_en_75s.wav');
  const videoVisual = path.join(WORK_DIR, 'video_clean_visual_75s.mp4');

  // 1. Sintetizar Audios Bilingües (ES & EN)
  await buildAudioTrack(SCENES_ES, 'es', 'em_alex', audioEs);
  await buildAudioTrack(SCENES_EN, 'en', 'am_adam', audioEn);

  // 2. Renderizar Pista Visual Limpia 1080p (Ken Burns cinematográfico sin subtítulos)
  await renderCleanVisualVideo(SCENES_ES, videoVisual);

  // 3. Ensamblar Videos Finales para la App
  const targetEs = path.join(OUTPUT_DIR, 'gerente_bottleneck_agente_es.mp4');
  const targetEn = path.join(OUTPUT_DIR, 'gerente_bottleneck_agente_en.mp4');
  const targetMaster = path.join(OUTPUT_DIR, 'gerente_bottleneck_agente.mp4');

  console.log('\n🎬 [COMPOSITOR]: Ensamblando video maestro en Español (75s)...');
  const mergeCmdEs = `ffmpeg -y -i "${videoVisual}" -i "${audioEs}" -c:v copy -c:a aac -b:a 192k -shortest "${targetEs}"`;
  execSync(mergeCmdEs, { stdio: 'inherit' });
  fs.copyFileSync(targetEs, targetMaster);

  console.log('🎬 [COMPOSITOR]: Ensamblando video maestro en Inglés (75s)...');
  const mergeCmdEn = `ffmpeg -y -i "${videoVisual}" -i "${audioEn}" -c:v copy -c:a aac -b:a 192k -shortest "${targetEn}"`;
  execSync(mergeCmdEn, { stdio: 'inherit' });

  console.log('\n================================================================');
  console.log('  ✅ PRODUCCIÓN COMPLETADA: VIDEOS LIMPIOS LISTOS PARA LA APP');
  console.log('================================================================');
}

main().catch(console.error);
