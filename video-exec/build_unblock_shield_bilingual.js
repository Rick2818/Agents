import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CUES_EN = [
  { id: 1, delay: 0.1, text: "In today's business world, time and certainty are any organization's most valuable assets." },
  { id: 2, delay: 7.8, text: "Identifying the exact moment to evolve requires strategic vision and leadership ready to take the next step." },
  { id: 3, delay: 16.4, text: "Every corporate challenge demands tailor-made solutions, far from generic formulas or improvised answers." },
  { id: 4, delay: 24.7, text: "Because true precision is not measured in intentions, but in the ability to execute with absolute punctuality." },
  { id: 5, delay: 32.6, text: "The first step toward transformation begins when we choose to seek the right market alliance." },
  { id: 6, delay: 39.7, text: "Thoroughly understanding a client's needs is the essential foundation of any value proposition." },
  { id: 7, delay: 46.9, text: "Our service does not seek to impose drastic changes, but to articulate seamless solutions that empower the current model." },
  { id: 8, delay: 55.3, text: "Clarity at every stage of the process builds a relationship rooted in transparency and mutual trust." },
  { id: 9, delay: 62.5, text: "Listening attentively and adapting to each business context marks the difference between a vendor and a true partner." },
  { id: 10, delay: 70.0, text: "We design every solution with the technical rigor and solidity needed to guarantee a tangible return." },
  { id: 11, delay: 77.5, text: "When both parties' goals align, agreements consolidate naturally and sustainably." },
  { id: 12, delay: 84.8, text: "A handshake represents far more than a signed contract; it symbolizes a commitment to results." },
  { id: 13, delay: 92.2, text: "The success of a comprehensive strategy is immediately reflected in the peace of mind of decision-makers." },
  { id: 14, delay: 99.5, text: "Having the right backing empowers organizations to move forward steadily toward their most ambitious goals." },
  { id: 15, delay: 106.6, text: "Building a company's future is possible when the right vision unites with the right service." }
];

const workDir = path.resolve('video-exec/unblock_en_audio');
if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });

console.log('Generating English voice clips for Unblock AI Shield video...');

for (const cue of CUES_EN) {
  const outFile = path.join(workDir, `cue_${cue.id}.wav`);
  if (!fs.existsSync(outFile)) {
    console.log(`Generating Cue ${cue.id}...`);
    const cmd = `npx hyperframes@0.8.62 tts "${cue.text}" -o "${outFile}" --voice am_adam --lang en-us`;
    execSync(cmd, { stdio: 'inherit' });
  }
}

// Generate 114s ambient bed
const bgMusic = path.join(workDir, 'ambient_bed_114s.wav');
if (!fs.existsSync(bgMusic)) {
  console.log('Generating 114s ambient music bed...');
  const synthCmd = `ffmpeg -y -f lavfi -i "sine=frequency=110:duration=114" -f lavfi -i "sine=frequency=220:duration=114" -f lavfi -i "sine=frequency=329.63:duration=114" -filter_complex "[0:a]volume=0.25[a0];[1:a]volume=0.15[a1];[2:a]volume=0.1[a2];[a0][a1][a2]amix=inputs=3,lowpass=f=800,volume=0.16,afade=t=in:ss=0:d=2,afade=t=out:st=110:d=4[out]" -map "[out]" "${bgMusic}"`;
  execSync(synthCmd, { stdio: 'inherit' });
}

// Build ffmpeg complex filter to mix all 15 English cues
const inputs = ['-i', bgMusic];
const filterParts = ['[0:a]volume=0.25[bg]'];
const mixInputs = ['[bg]'];

CUES_EN.forEach((cue, idx) => {
  const file = path.join(workDir, `cue_${cue.id}.wav`);
  inputs.push('-i', file);
  const inIdx = idx + 1;
  const delayMs = Math.round(cue.delay * 1000);
  filterParts.push(`[${inIdx}:a]adelay=${delayMs}|${delayMs},volume=1.4[v${cue.id}]`);
  mixInputs.push(`[v${cue.id}]`);
});

const filterComplex = `${filterParts.join(';')};${mixInputs.join('')}amix=inputs=${CUES_EN.length + 1}:dropout_transition=0:normalize=0[out]`;
const finalAudio = path.join(workDir, 'final_unblock_en_114s.wav');

console.log('Mixing English audio for Unblock AI Shield...');
const mixCmd = `ffmpeg -y ${inputs.join(' ')} -filter_complex "${filterComplex}" -map "[out]" -t 114 "${finalAudio}"`;
execSync(mixCmd, { stdio: 'inherit' });

// Merge with video stream from Unblock_AI_Shield_Oficial.mp4
const sourceVideo = path.resolve('assets/videos/Unblock_AI_Shield_Oficial.mp4');
const targetVideoEn = path.resolve('assets/videos/Unblock_AI_Shield_Oficial_en.mp4');

console.log('Creating Unblock_AI_Shield_Oficial_en.mp4...');
const mergeCmd = `ffmpeg -y -i "${sourceVideo}" -i "${finalAudio}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest "${targetVideoEn}"`;
execSync(mergeCmd, { stdio: 'inherit' });

console.log('SUCCESS! Created Unblock_AI_Shield_Oficial_en.mp4');
