import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const files = [
  'assets/videos/Unblock_AI_Shield_Oficial.mp4',
  'assets/videos/Unblock_AI_Shield_Oficial_en.mp4',
  'assets/videos/boltech_corporate_5scenes_es.mp4',
  'assets/videos/boltech_corporate_5scenes_en.mp4',
  'assets/videos/gerente_bottleneck_agente_es.mp4',
  'assets/videos/gerente_bottleneck_agente_en.mp4',
  'assets/videos/gerente_bottleneck_agente.mp4'
];

for (const rel of files) {
  const f = path.resolve(rel);
  if (fs.existsSync(f)) {
    const tmp = f.replace('.mp4', '_web_standard.mp4');
    console.log(`🎬 Recodificando a formato 100% universal (yuv420p + faststart): ${rel}`);
    const cmd = `ffmpeg -y -i "${f}" -vf "format=yuv420p" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k "${tmp}"`;
    execSync(cmd, { stdio: 'inherit' });
    fs.copyFileSync(tmp, f);
    fs.unlinkSync(tmp);
  }
}

console.log('✅ Todos los videos están ahora en formato universal web y compatibles al 100%.');
