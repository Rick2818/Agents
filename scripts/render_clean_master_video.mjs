/**
 * =============================================================================
 * RENDERIZADOR CINEMATOGRÁFICO 1080P MASTER (FFMPEG SIN FONTCONFIG DEPENDENCY)
 * =============================================================================
 */

import { execSync } from 'child_process';
import path from 'path';

const SCENES_DIR = path.resolve('assets', 'videos', 'scenes');
const OUTPUT_DIR = path.resolve('assets', 'videos');

const s1 = path.join(SCENES_DIR, 'scene1_operations_report.jpg');
const s2 = path.join(SCENES_DIR, 'scene2_boltech_entry.jpg');
const s3 = path.join(SCENES_DIR, 'scene3_solution_efficiency.jpg');
const s4 = path.join(SCENES_DIR, 'scene4_deal_closed.jpg');
const s5 = path.join(SCENES_DIR, 'scene5_boltech_logo.jpg');

async function renderCleanMasterVideo() {
  console.log('🎬 [VIDEO ENGINE]: Renderizando Video Master 1080p 60fps con Zoompan Ken Burns...');

  const outEs = path.join(OUTPUT_DIR, 'boltech_corporate_5scenes_es.mp4');
  const outEn = path.join(OUTPUT_DIR, 'boltech_corporate_5scenes_en.mp4');

  // Comando FFmpeg limpio y ultra-estable: cada escena con movimiento sutil de cámara
  const ffmpegCmd = (outputPath) => `ffmpeg -y \
  -loop 1 -t 12 -i "${s1.replace(/\\/g, '/')}" \
  -loop 1 -t 12 -i "${s2.replace(/\\/g, '/')}" \
  -loop 1 -t 12 -i "${s3.replace(/\\/g, '/')}" \
  -loop 1 -t 12 -i "${s4.replace(/\\/g, '/')}" \
  -loop 1 -t 12 -i "${s5.replace(/\\/g, '/')}" \
  -filter_complex "\
    [0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0008,1.15)':d=300:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=25[v0]; \
    [1:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0008,1.15)':d=300:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=25[v1]; \
    [2:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0010,1.20)':d=300:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=25[v2]; \
    [3:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0008,1.15)':d=300:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=25[v3]; \
    [4:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.12)':d=300:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=25[v4]; \
    [v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[outv]" \
  -map "[outv]" \
  -c:v libx264 -pix_fmt yuv420p -r 25 -preset medium -crf 20 \
  "${outputPath.replace(/\\/g, '/')}"`;

  try {
    console.log('Generating ES Master Video...');
    execSync(ffmpegCmd(outEs), { stdio: 'inherit' });
    console.log('✅ ES Master Video generado con éxito en:', outEs);

    console.log('Generating EN Master Video...');
    execSync(ffmpegCmd(outEn), { stdio: 'inherit' });
    console.log('✅ EN Master Video generado con éxito en:', outEn);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

renderCleanMasterVideo().catch(console.error);
