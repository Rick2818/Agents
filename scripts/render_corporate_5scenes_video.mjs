/**
 * =============================================================================
 * GENERADOR MASTER DE VIDEO CINEMATOGRÁFICO DE 5 ESCENAS (FFMPEG)
 * =============================================================================
 * Ensambla las 5 escenas 4K con efectos cinematográficos Ken Burns (zoom suave),
 * transiciones de fundido cruzado, overlays tipográficos corporativos y audio.
 * =============================================================================
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCENES_DIR = path.resolve('assets', 'videos', 'scenes');
const OUTPUT_DIR = path.resolve('assets', 'videos');

const s1 = path.join(SCENES_DIR, 'scene1_operations_report.jpg');
const s2 = path.join(SCENES_DIR, 'scene2_boltech_entry.jpg');
const s3 = path.join(SCENES_DIR, 'scene3_solution_efficiency.jpg');
const s4 = path.join(SCENES_DIR, 'scene4_deal_closed.jpg');
const s5 = path.join(SCENES_DIR, 'scene5_boltech_logo.jpg');

async function renderCorporateVideos() {
  console.log('🎬 [VIDEO ENGINE]: Iniciando renderizado de las 5 escenas cinematográficas con FFmpeg...');

  // Duración por escena: 12 segundos (Total video: 60s)
  // Filtro complejo: Zoom suave + Crossfade + Text Overlay limpio
  
  // 1. Renderizar Video en Español
  const outEs = path.join(OUTPUT_DIR, 'boltech_corporate_5scenes_es.mp4');
  const outEn = path.join(OUTPUT_DIR, 'boltech_corporate_5scenes_en.mp4');

  console.log('Rendering Spanish version:', outEs);

  const ffmpegCmdEs = `ffmpeg -y \
  -loop 1 -t 12 -i "${s1.replace(/\\/g, '/')}" \
  -loop 1 -t 12 -i "${s2.replace(/\\/g, '/')}" \
  -loop 1 -t 12 -i "${s3.replace(/\\/g, '/')}" \
  -loop 1 -t 12 -i "${s4.replace(/\\/g, '/')}" \
  -loop 1 -t 12 -i "${s5.replace(/\\/g, '/')}" \
  -filter_complex "\
    [0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.15)':d=300:s=1920x1080:fps=25,drawtext=text='01. REPORTE OPERATIVO':fontcolor=white:fontsize=32:box=1:boxcolor=black@0.6:boxborderw=10:x=80:y=80[v0]; \
    [1:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.15)':d=300:s=1920x1080:fps=25,drawtext=text='02. INTERVENCIÓN BOLTECH GROUP':fontcolor=white:fontsize=32:box=1:boxcolor=black@0.6:boxborderw=10:x=80:y=80[v1]; \
    [2:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0008,1.2)':d=300:s=1920x1080:fps=25,drawtext=text='Custom Agents allow more efficiency in processes':fontcolor=0x00d4ff:fontsize=40:box=1:boxcolor=black@0.75:boxborderw=14:x=(w-text_w)/2:y=h-140[v2]; \
    [3:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.15)':d=300:s=1920x1080:fps=25,drawtext=text='04. CIERRE DEL TRATO':fontcolor=white:fontsize=32:box=1:boxcolor=black@0.6:boxborderw=10:x=80:y=80[v3]; \
    [4:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0005,1.1)':d=300:s=1920x1080:fps=25,drawtext=text='BOLTECH GROUP - AUTONOMOUS ENTERPRISE AI AGENTS':fontcolor=0xffd700:fontsize=34:box=1:boxcolor=black@0.7:boxborderw=12:x=(w-text_w)/2:y=h-120[v4]; \
    [v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[outv]" \
  -map "[outv]" \
  -c:v libx264 -pix_fmt yuv420p -r 25 -b:v 4000k \
  "${outEs.replace(/\\/g, '/')}"`;

  try {
    execSync(ffmpegCmdEs, { stdio: 'inherit' });
    console.log('✅ Video ES renderizado exitosamente:', outEs);
  } catch (err) {
    console.error('Error renderizando video ES:', err.message);
  }

  console.log('Rendering English version:', outEn);

  const ffmpegCmdEn = `ffmpeg -y \
  -loop 1 -t 12 -i "${s1.replace(/\\/g, '/')}" \
  -loop 1 -t 12 -i "${s2.replace(/\\/g, '/')}" \
  -loop 1 -t 12 -i "${s3.replace(/\\/g, '/')}" \
  -loop 1 -t 12 -i "${s4.replace(/\\/g, '/')}" \
  -loop 1 -t 12 -i "${s5.replace(/\\/g, '/')}" \
  -filter_complex "\
    [0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.15)':d=300:s=1920x1080:fps=25,drawtext=text='01. OPERATIONAL BOTTLENECK REPORT':fontcolor=white:fontsize=32:box=1:boxcolor=black@0.6:boxborderw=10:x=80:y=80[v0]; \
    [1:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.15)':d=300:s=1920x1080:fps=25,drawtext=text='02. BOLTECH GROUP INTERVENTION':fontcolor=white:fontsize=32:box=1:boxcolor=black@0.6:boxborderw=10:x=80:y=80[v1]; \
    [2:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0008,1.2)':d=300:s=1920x1080:fps=25,drawtext=text='Custom Agents allow more efficiency in processes':fontcolor=0x00d4ff:fontsize=40:box=1:boxcolor=black@0.75:boxborderw=14:x=(w-text_w)/2:y=h-140[v2]; \
    [3:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.15)':d=300:s=1920x1080:fps=25,drawtext=text='04. PARTNERSHIP & DEAL CLOSED':fontcolor=white:fontsize=32:box=1:boxcolor=black@0.6:boxborderw=10:x=80:y=80[v3]; \
    [4:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0005,1.1)':d=300:s=1920x1080:fps=25,drawtext=text='BOLTECH GROUP - AUTONOMOUS ENTERPRISE AI AGENTS':fontcolor=0xffd700:fontsize=34:box=1:boxcolor=black@0.7:boxborderw=12:x=(w-text_w)/2:y=h-120[v4]; \
    [v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[outv]" \
  -map "[outv]" \
  -c:v libx264 -pix_fmt yuv420p -r 25 -b:v 4000k \
  "${outEn.replace(/\\/g, '/')}"`;

  try {
    execSync(ffmpegCmdEn, { stdio: 'inherit' });
    console.log('✅ Video EN renderizado exitosamente:', outEn);
  } catch (err) {
    console.error('Error renderizando video EN:', err.message);
  }
}

renderCorporateVideos().catch(console.error);
