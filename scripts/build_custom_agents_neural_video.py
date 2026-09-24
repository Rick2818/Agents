import asyncio
import os
import sys
import subprocess
import edge_tts

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


# Paths
WORK_DIR = os.path.abspath("video-exec/custom_agents_neural_75s")
os.makedirs(WORK_DIR, exist_ok=True)
OUTPUT_DIR = os.path.abspath("assets/videos")
SCENES_DIR = os.path.abspath("assets/videos/scenes")

# Scripts Definition (75s total)
# Scene 1: Logo Intro (0-6s)
# Scene 2: Manager Bottleneck (6-18s)
# Scene 3: Team Overwhelmed (18-30s)
# Scene 4: Agent Deployment (30-45s)
# Scene 5: Boardroom Deal Closed (45-60s)
# Scene 6: Logo Outro + CTA (60-75s)

SCENES_ES = [
    {
        "id": 1,
        "duration": 6,
        "delay": 0.3,
        "text": "Boltech-Group presenta: Custom Agents.",
        "bgImg": os.path.join(SCENES_DIR, "scene1_intro_logo.jpg")
    },
    {
        "id": 2,
        "duration": 12,
        "delay": 6.3,
        "text": "Medianoche en la oficina. Un gerente general enfrenta cientos de consultas sin responder y cotizaciones varadas en procedimientos ineficientes.",
        "bgImg": os.path.join(SCENES_DIR, "scene2_manager_bottleneck.jpg")
    },
    {
        "id": 3,
        "duration": 12,
        "delay": 18.3,
        "text": "Estos cuellos de botella queman mil ochocientos cincuenta dólares cada semana. Contratar más personal infla la nómina; no hacer nada destruye el flujo de caja.",
        "bgImg": os.path.join(SCENES_DIR, "scene3_team_overwhelmed.jpg")
    },
    {
        "id": 4,
        "duration": 15,
        "delay": 30.3,
        "text": "La solución: desplegar Custom Agents de Boltech-Group. En sesenta segundos, transforman procedimientos ineficientes en procesos automáticos de alta precisión.",
        "bgImg": os.path.join(SCENES_DIR, "scene4_agent_deployment.jpg")
    },
    {
        "id": 5,
        "duration": 15,
        "delay": 45.3,
        "text": "A la mañana siguiente: respuestas en ocho segundos, cotizaciones instantáneas y contratos Enterprise cerrados y cobrados vía Stripe con cero nómina humana.",
        "bgImg": os.path.join(SCENES_DIR, "scene5_deal_closed_handshake.jpg")
    },
    {
        "id": 6,
        "duration": 15,
        "delay": 60.3,
        "text": "Erradica los cuellos de botella de tu empresa hoy mismo. Activa tu agente en la nube con nuestra garantía incondicional de siete días visitando boltech guión group punto vercel punto app. Boltech-Group.",
        "bgImg": os.path.join(SCENES_DIR, "scene6_outro_cta.jpg")
    }
]

SCENES_EN = [
    {
        "id": 1,
        "duration": 6,
        "delay": 0.3,
        "text": "Boltech-Group presents: Custom Agents.",
        "bgImg": os.path.join(SCENES_DIR, "scene1_intro_logo.jpg")
    },
    {
        "id": 2,
        "duration": 12,
        "delay": 6.3,
        "text": "Midnight at the office. A general manager finds hundreds of unanswered customer chats and delayed quotes trapped in inefficient procedures.",
        "bgImg": os.path.join(SCENES_DIR, "scene2_manager_bottleneck.jpg")
    },
    {
        "id": 3,
        "duration": 12,
        "delay": 18.3,
        "text": "These bottlenecks bleed up to eighteen hundred and fifty dollars every week. Hiring more staff inflates payroll; doing nothing drains bottom-line cash flow.",
        "bgImg": os.path.join(SCENES_DIR, "scene3_team_overwhelmed.jpg")
    },
    {
        "id": 4,
        "duration": 15,
        "delay": 30.3,
        "text": "The solution: deploy Boltech-Group's Custom Agents. In sixty seconds, they turn inefficient procedures into high-efficiency automated workflows.",
        "bgImg": os.path.join(SCENES_DIR, "scene4_agent_deployment.jpg")
    },
    {
        "id": 5,
        "duration": 15,
        "delay": 45.3,
        "text": "Next morning: eight-second replies, instant precision quotes, and Enterprise deals closed and collected via Stripe with zero human payroll.",
        "bgImg": os.path.join(SCENES_DIR, "scene5_deal_closed_handshake.jpg")
    },
    {
        "id": 6,
        "duration": 15,
        "delay": 60.3,
        "text": "Eradicate office bottlenecks today. Launch your cloud agent with our unconditional seven-day guarantee at boltech dash group dot vercel dot app. Boltech-Group.",
        "bgImg": os.path.join(SCENES_DIR, "scene6_outro_cta.jpg")
    }
]

async def generate_speech_clips(scenes, lang, voice):
    print(f"🎙️ Generando locución neural {lang.upper()} con voz {voice}...")
    clip_files = []
    for s in scenes:
        out_mp3 = os.path.join(WORK_DIR, f"scene_{s['id']}_{lang}.mp3")
        out_wav = os.path.join(WORK_DIR, f"scene_{s['id']}_{lang}.wav")
        
        # Generate with Edge Neural TTS
        comm = edge_tts.Communicate(s['text'], voice)
        await comm.save(out_mp3)
        
        # Convert to standard 44.1kHz WAV
        subprocess.run([
            "ffmpeg", "-y", "-i", out_mp3,
            "-ar", "44100", "-ac", "1", out_wav
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        clip_files.append(out_wav)
        print(f"  ✓ Escena {s['id']} ({lang}) generada")
    return clip_files

def mix_audio_track(scenes, clip_files, lang, out_audio_path):
    print(f"🎛️ Mezclando pista musical y locución para {lang.upper()} (75s)...")
    bg_bed = os.path.join(WORK_DIR, "ambient_bed_75s.wav")
    if not os.path.exists(bg_bed):
        synth_cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "sine=frequency=110:duration=75",
            "-f", "lavfi", "-i", "sine=frequency=220:duration=75",
            "-f", "lavfi", "-i", "sine=frequency=330:duration=75",
            "-filter_complex",
            "[0:a]volume=0.2[a0];[1:a]volume=0.1[a1];[2:a]volume=0.08[a2];"
            "[a0][a1][a2]amix=inputs=3,lowpass=f=750,volume=0.10,afade=t=in:ss=0:d=2,afade=t=out:st=72:d=3[out]",
            "-map", "[out]", bg_bed
        ]
        subprocess.run(synth_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    inputs = ["-i", bg_bed]
    filter_parts = ["[0:a]volume=0.18[bg]"]
    mix_inputs = ["[bg]"]

    for idx, s in enumerate(scenes):
        f = clip_files[idx]
        inputs.extend(["-i", f])
        in_idx = idx + 1
        delay_ms = int(round(s["delay"] * 1000))
        filter_parts.append(f"[{in_idx}:a]adelay={delay_ms}|{delay_ms},volume=1.8[v{s['id']}]")
        mix_inputs.append(f"[v{s['id']}]")

    filter_complex = f"{';'.join(filter_parts)};{''.join(mix_inputs)}amix=inputs={len(scenes) + 1}:dropout_transition=0:normalize=0[out]"
    mix_cmd = ["ffmpeg", "-y"] + inputs + [
        "-filter_complex", filter_complex,
        "-map", "[out]",
        "-t", "75",
        out_audio_path
    ]
    subprocess.run(mix_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"  ✓ Audio final {lang.upper()} mezclado correctamente.")

def render_scene_clip(img_path, duration, out_clip_path, zoom_direction="in"):
    total_frames = int(duration * 25)
    # Slow subtle Ken Burns zoompan
    if zoom_direction == "in":
        zoom_expr = "min(zoom+0.0004,1.10)"
    else:
        zoom_expr = "if(eq(on,1),1.10,max(1.0,zoom-0.0004))"
        
    vf = (
        f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
        f"zoompan=z='{zoom_expr}':d={total_frames}:s=1920x1080:fps=25"
    )
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-t", str(duration),
        "-i", img_path,
        "-vf", vf,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-r", "25",
        "-preset", "veryfast",
        "-crf", "18",
        "-t", str(duration),
        out_clip_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def render_full_visual_video(scenes, out_video_path):
    print("🎬 Renderizando las 6 escenas visuales de forma individual e independiente...")
    scene_clips = []
    directions = ["in", "out", "in", "out", "in", "out"]
    
    for idx, s in enumerate(scenes):
        clip_path = os.path.join(WORK_DIR, f"scene_clip_{s['id']}.mp4")
        print(f"  - Renderizando Escena {s['id']} ({s['duration']}s): {os.path.basename(s['bgImg'])}...")
        render_scene_clip(s['bgImg'], s['duration'], clip_path, directions[idx])
        scene_clips.append(clip_path)

    # Concat list file
    concat_txt = os.path.join(WORK_DIR, "scenes_list.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for c in scene_clips:
            # Escape path for ffmpeg concat
            f.write(f"file '{c.replace(os.sep, '/')}'\n")

    print("🎞️ Ensamblando las 6 escenas concatenadas en 1080p limpio (75s)...")
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_txt,
        "-c", "copy",
        out_video_path
    ]
    subprocess.run(concat_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("  ✓ Pista de video 1080p ensamblada con éxito.")

async def main():
    print("================================================================")
    print(" PRODUCCIÓN DEFINITIVA: 6 ESCENAS REALES + AUDIO NEURAL DE PRECISIÓN")
    print("================================================================\n")

    # 1. Audio tracks
    audio_es = os.path.join(WORK_DIR, "audio_es_75s.wav")
    audio_en = os.path.join(WORK_DIR, "audio_en_75s.wav")
    
    # Executive Neural Voices (Hyper-realistic with pristine English and Spanish diction)
    voice_es = "es-MX-JorgeNeural"
    voice_en = "en-US-ChristopherNeural"

    clips_es = await generate_speech_clips(SCENES_ES, "es", voice_es)
    mix_audio_track(SCENES_ES, clips_es, "es", audio_es)

    clips_en = await generate_speech_clips(SCENES_EN, "en", voice_en)
    mix_audio_track(SCENES_EN, clips_en, "en", audio_en)

    # 2. Render Visual 1080p Video (No Subtitles, 6 Distinct Photorealistic Scenes)
    video_visual = os.path.join(WORK_DIR, "visual_6scenes_clean_75s.mp4")
    render_full_visual_video(SCENES_ES, video_visual)

    # 3. Final Muxing for App
    target_es = os.path.join(OUTPUT_DIR, "gerente_bottleneck_agente_es.mp4")
    target_en = os.path.join(OUTPUT_DIR, "gerente_bottleneck_agente_en.mp4")
    target_master = os.path.join(OUTPUT_DIR, "gerente_bottleneck_agente.mp4")

    print("\n🎬 Generando entregable final en Español (75s)...")
    subprocess.run([
        "ffmpeg", "-y",
        "-i", video_visual,
        "-i", audio_es,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        target_es
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    subprocess.run(["ffmpeg", "-y", "-i", target_es, "-c", "copy", target_master], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    print("🎬 Generando entregable final en Inglés (75s)...")
    subprocess.run([
        "ffmpeg", "-y",
        "-i", video_visual,
        "-i", audio_en,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        target_en
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    print("\n================================================================")
    print("  ✅ VIDEOS RENDERIZADOS CON ÉXITO: 6 ESCENAS + AUDIO NEURAL")
    print("================================================================")

if __name__ == "__main__":
    asyncio.run(main())
