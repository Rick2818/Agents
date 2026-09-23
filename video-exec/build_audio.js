import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCENES = [
  { id: 1, delay: 0.5, text: "Midnight. A general manager opens his CRM to find 128 customer inquiries completely unanswered." },
  { id: 2, delay: 10.5, text: "Customers waiting over four hours across WhatsApp and web. High-intent deals slipping away every minute." },
  { id: 3, delay: 20.5, text: "Leads bounce between sales and operations, causing a devastating revenue leak of eighteen hundred dollars a week." },
  { id: 4, delay: 30.5, text: "Hiring more staff adds forty thousand dollars in annual overhead. Doing nothing burns nearly one hundred thousand." },
  { id: 5, delay: 40.5, text: "The decision: deploy BolTech Sentinel AI. In just sixty seconds, the autonomous agent is fully live." },
  { id: 6, delay: 50.5, text: "Next morning. The agent responds to qualified inquiries in eight seconds, delivering instant quotes." },
  { id: 7, delay: 60.5, text: "A four hundred and ninety dollar Enterprise contract is closed and paid via Stripe. Zero human payroll required." },
  { id: 8, delay: 70.5, text: "Within thirty days: one hundred and eighty-four percent ROI, sixty percent close rate, and thirty-five hours saved per week." },
  { id: 9, delay: 80.5, text: "BolTech Group. Backed by our seven-day money-back guarantee. Visit boltech-group.vercel.app today." }
];

const workDir = path.resolve('video-exec/audio_parts');
if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });

console.log('Generating voice clips for 9 scenes...');

for (const scene of SCENES) {
  const outFile = path.join(workDir, `scene_${scene.id}.wav`);
  if (!fs.existsSync(outFile)) {
    console.log(`Generating Scene ${scene.id}...`);
    const cmd = `npx hyperframes@0.8.62 tts "${scene.text}" -o "${outFile}" --voice am_adam --lang en-us`;
    execSync(cmd, { stdio: 'inherit' });
  } else {
    console.log(`Scene ${scene.id} already exists.`);
  }
}

console.log('All voice clips ready. Generating full synchronized audio mix...');

// Generate 90s ambient tech background pad using ffmpeg synth audio
const bgMusic = path.join(workDir, 'ambient_bed.wav');
if (!fs.existsSync(bgMusic)) {
  console.log('Generating ambient music bed...');
  // Elegant electronic drone/pad chord: A minor (220Hz, 261.63Hz, 329.63Hz) with lowpass filter and subtle tremolo
  const synthCmd = `ffmpeg -y -f lavfi -i "sine=frequency=110:duration=90" -f lavfi -i "sine=frequency=220:duration=90" -f lavfi -i "sine=frequency=329.63:duration=90" -filter_complex "[0:a]volume=0.25[a0];[1:a]volume=0.15[a1];[2:a]volume=0.1[a2];[a0][a1][a2]amix=inputs=3,lowpass=f=800,volume=0.18,afade=t=in:ss=0:d=2,afade=t=out:st=87:d=3[out]" -map "[out]" "${bgMusic}"`;
  execSync(synthCmd, { stdio: 'inherit' });
}

// Build ffmpeg complex filter to delay each voice clip and mix with ambient bed
const inputs = ['-i', bgMusic];
const filterParts = ['[0:a]volume=0.3[bg]'];
const mixInputs = ['[bg]'];

SCENES.forEach((scene, idx) => {
  const file = path.join(workDir, `scene_${scene.id}.wav`);
  inputs.push('-i', file);
  const inIdx = idx + 1;
  const delayMs = Math.round(scene.delay * 1000);
  filterParts.push(`[${inIdx}:a]adelay=${delayMs}|${delayMs},volume=1.3[v${scene.id}]`);
  mixInputs.push(`[v${scene.id}]`);
});

const filterComplex = `${filterParts.join(';')};${mixInputs.join('')}amix=inputs=${SCENES.length + 1}:dropout_transition=0:normalize=0[out]`;
const finalAudio = path.join(workDir, 'final_narration_90s.wav');

console.log('Mixing narration and ambient bed...');
const mixCmd = `ffmpeg -y ${inputs.join(' ')} -filter_complex "${filterComplex}" -map "[out]" -t 90 "${finalAudio}"`;
execSync(mixCmd, { stdio: 'inherit' });

console.log('Synchronized audio generated at:', finalAudio);

// Now merge with the video
const sourceVideo = path.resolve('video-exec/gerente-bottleneck/gerente_bottleneck_agente.mp4');
const targetVideo = path.resolve('assets/videos/gerente_bottleneck_agente.mp4');

console.log('Merging audio into final MP4 video...');
const mergeCmd = `ffmpeg -y -i "${sourceVideo}" -i "${finalAudio}" -c:v copy -c:a aac -b:a 192k -shortest "${targetVideo}"`;
execSync(mergeCmd, { stdio: 'inherit' });

console.log('SUCCESS! Video updated with full audio at:', targetVideo);
