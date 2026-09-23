/**
 * =============================================================================
 * RENDERIZADOR RÁPIDO & PRECISO (60 SEGUNDOS / 5 ESCENAS)
 * =============================================================================
 */

import { execSync } from 'child_process';
import path from 'path';

const SCENES_DIR = path.resolve('assets', 'videos', 'scenes');
const OUTPUT_DIR = path.resolve('assets', 'videos');

const s1 = path.join(SCENES_DIR, 'scene1_operations_report.jpg').replace(/\\/g, '/');
const s2 = path.join(SCENES_DIR, 'scene2_boltech_entry.jpg').replace(/\\/g, '/');
const s3 = path.join(SCENES_DIR, 'scene3_solution_efficiency.jpg').replace(/\\/g, '/');
const s4 = path.join(SCENES_DIR, 'scene4_deal_closed.jpg').replace(/\\/g, '/');
const s5 = path.join(SCENES_DIR, 'scene5_boltech_logo.jpg').replace(/\\/g, '/');

const outEs = path.join(OUTPUT_DIR, 'boltech_corporate_5scenes_es.mp4').replace(/\\/g, '/');
const outEn = path.join(OUTPUT_DIR, 'boltech_corporate_5scenes_en.mp4').replace(/\\/g, '/');

// Cada clip dura exactamente 12 segundos (300 frames a 25fps)
function buildCommand(outputFile) {
  return `ffmpeg -y \
  -framerate 25 -loop 1 -t 12 -i "${s1}" \
  -framerate 25 -loop 1 -t 12 -i "${s2}" \
  -framerate 25 -loop 1 -t 12 -i "${s3}" \
  -framerate 25 -loop 1 -t 12 -i "${s4}" \
  -framerate 25 -loop 1 -t 12 -i "${s5}" \
  -filter_complex "\
    [0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=300:s=1920x1080:fps=25[v0]; \
    [1:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=300:s=1920x1080:fps=25[v1]; \
    [2:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0008,1.20)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=300:s=1920x1080:fps=25[v2]; \
    [3:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=300:s=1920x1080:fps=25[v3]; \
    [4:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0005,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=300:s=1920x1080:fps=25[v4]; \
    [v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[outv]" \
  -map "[outv]" \
  -c:v libx264 -pix_fmt yuv420p -r 25 -preset fast -crf 22 \
  "${outputFile}"`;
}

console.log('Rendering Spanish version (60s)...');
execSync(buildCommand(outEs), { stdio: 'inherit' });
console.log('✅ ES renderizado con éxito.');

console.log('Rendering English version (60s)...');
execSync(buildCommand(outEn), { stdio: 'inherit' });
console.log('✅ EN renderizado con éxito.');
