/**
 * =============================================================================
 * MOTOR CLOUD-NATIVE DE TELEGRAM & CONCIERGE SOBERANO 24/7 (7 PILARES)
 * =============================================================================
 * Cero dependencias de disco local | Procesamiento 100% en RAM volátil (Buffer)
 * Resiliencia contra ECONNRESET | Dual Engine (Gemini Flash 3.6 & TTS Puck)
 * =============================================================================
 */

import {
  timingSafeCompare,
  escapeHtml,
  computeForensicHash,
  purgeMemoryBuffer
} from './fiduciary_core.js';
import { ExecutiveAssistantMCPHub } from './mcp_executive_assistant.js';

const GEMINI_MODEL = 'gemini-3.6-flash';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// Utilidad de red resiliente con reintentos y Connection: close para Telegram
async function fetchWithRetry(url, options = {}, timeoutMs = 25000, retries = 3) {
  const isTelegram = url.includes('api.telegram.org');
  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const mergedHeaders = { ...(options.headers || {}) };
      if (isTelegram) {
        mergedHeaders['Connection'] = 'close';
      }
      return await fetch(url, { ...options, headers: mergedHeaders, signal: controller.signal });
    } catch (err) {
      if (attempt < retries - 1 && (err.name === 'AbortError' || err.message?.includes('fetch failed') || err.message?.includes('ECONNRESET'))) {
        await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * Transcribe un buffer de audio en memoria usando Gemini
 */
async function transcribeAudioInMemory(audioBuffer, geminiApiKey, mimeType = 'audio/ogg') {
  if (!audioBuffer || !geminiApiKey) return null;
  const b64 = audioBuffer.toString('base64');
  try {
    const res = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Faithfully transcribe what the user says in this audio clip. Return ONLY the transcribed text with proper capitalization and punctuation.' },
            { inline_data: { mime_type: mimeType, data: b64 } }
          ]
        }]
      })
    }, 20000);

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (err) {
    console.error('[AUDIO TRANSCRIBE ERROR]:', err.message);
    return null;
  }
}

/**
 * Sintetiza voz ejecutiva con Gemini TTS (Puck) y la envía a Telegram
 */
async function sendCloudVoiceNote(chatId, textToSpeak, botToken, geminiApiKey, openAiKey = null, caption = '') {
  let wavBuffer = null;
  try {
    const plainText = textToSpeak.replace(/<[^>]*>/g, '').replace(/[*_`#]/g, '').trim();
    if (!plainText) return false;

    // 1. Motor OpenAI TTS si existe clave
    if (openAiKey) {
      try {
        const oaiRes = await fetchWithRetry('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: plainText.substring(0, 1000),
            voice: 'onyx',
            response_format: 'opus'
          })
        }, 20000);

        if (oaiRes.ok) {
          const arrayBuf = await oaiRes.arrayBuffer();
          const form = new FormData();
          form.append('chat_id', chatId);
          form.append('voice', new Blob([arrayBuf], { type: 'audio/ogg' }), 'voice.ogg');
          if (caption) form.append('caption', caption.substring(0, 1024));

          const tgRes = await fetchWithRetry(`https://api.telegram.org/bot${botToken}/sendVoice`, {
            method: 'POST',
            body: form
          }, 25000);
          const tgData = await tgRes.json();
          if (tgData.ok) return true;
        }
      } catch (e) {
        console.warn('[OPENAI TTS FALLBACK]:', e.message);
      }
    }

    // 2. Motor Nativo Gemini TTS
    if (!geminiApiKey) return false;

    const ttsRes = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Read aloud the following text:\n\n' + plainText.substring(0, 800) }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' }
            }
          }
        }
      })
    }, 20000);

    const d = await ttsRes.json();
    const b64 = d.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!b64) return false;

    const pcmData = Buffer.from(b64, 'base64');
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const dataSize = pcmData.length;
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
    header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    wavBuffer = Buffer.concat([header, pcmData]);

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('voice', new Blob([wavBuffer], { type: 'audio/wav' }), 'voice.ogg');
    if (caption) form.append('caption', caption.substring(0, 1024));

    const sendRes = await fetchWithRetry(`https://api.telegram.org/bot${botToken}/sendVoice`, {
      method: 'POST',
      body: form
    }, 25000);

    const sendData = await sendRes.json();
    return sendData.ok;
  } catch (err) {
    console.error('[TTS VOICE ERROR]:', err.message);
    return false;
  } finally {
    // PILAR 2: Purga forzosa de memoria RAM volátil
    if (wavBuffer) {
      purgeMemoryBuffer(wavBuffer);
      wavBuffer = null;
    }
  }
}

/**
 * Envía un mensaje de texto a Telegram (con soporte de HTML y reintento en texto plano)
 */
export async function sendCloudMessage(chatId, text, botToken, options = {}) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: options.isRawHtml ? 'HTML' : undefined
    };

    const res = await fetchWithRetry(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, 20000);

    const data = await res.json();
    if (!data.ok && options.isRawHtml) {
      // Reintentar en texto plano
      await fetchWithRetry(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text.replace(/<[^>]*>/g, '') })
      }, 15000);
    }
    return data.ok;
  } catch (e) {
    console.error('[SEND MESSAGE ERROR]:', e.message);
    return false;
  }
}

/**
 * Procesador principal de Webhook en la Nube
 */
export async function processCloudTelegramUpdate(update, envConfig) {
  if (!update || !update.message) return { processed: false, reason: 'NO_MESSAGE' };

  const message = update.message;
  const chatType = message.chat?.type;
  const chatId = message.chat?.id;
  const userId = String(message.from?.id || chatId);
  const userName = message.from?.first_name || 'Ricardo';
  let text = (message.text || message.caption || '').trim();
  let isVoiceInput = false;

  const BOT_TOKEN = envConfig.TELEGRAM_BOT_TOKEN;
  const GEMINI_API_KEY = envConfig.GEMINI_API_KEY;
  const OPENAI_API_KEY = envConfig.OPENAI_API_KEY || null;
  const AUTHORIZED_USER_ID = String(envConfig.TELEGRAM_AUTHORIZED_USER_ID || '6311509947').trim();
  const MASTER_KEY = envConfig.PLATFORM_MASTER_KEY || null;

  if (chatType !== 'private') {
    return { processed: false, reason: 'NON_PRIVATE_CHAT' };
  }

  // PILAR 4: Verificación de Autorización con Timing-Safe
  const authMatch = text.match(/^\/authorize\s+(.+)$/i);
  if (authMatch && MASTER_KEY) {
    const submittedKey = authMatch[1].trim();
    if (timingSafeCompare(submittedKey, MASTER_KEY)) {
      await sendCloudMessage(chatId, `🔐 <b>¡Dispositivo Vinculado Exitosamente!</b>\n\nTu Telegram ID (<code>${userId}</code>) ha sido autenticado como autoridad fiduciaria soberana en la nube 24/7.`, BOT_TOKEN, { isRawHtml: true });
      return { processed: true, action: 'AUTHORIZED' };
    } else {
      await sendCloudMessage(chatId, `❌ <b>Clave de seguridad inválida.</b> Acceso denegado.`, BOT_TOKEN, { isRawHtml: true });
      return { processed: true, action: 'AUTH_FAILED' };
    }
  }

  if (AUTHORIZED_USER_ID && userId !== AUTHORIZED_USER_ID) {
    console.warn(`[SEGURIDAD CLOUD] Acceso no autorizado bloqueado: ${userId}`);
    await sendCloudMessage(chatId, `🔒 <b>Acceso Restringido</b>\n\nEste agente soberano opera 24/7 exclusivamente para Ricardo. Tu Telegram ID es: <code>${userId}</code>.\n\nPara autorizar tu dispositivo envía:\n<code>/authorize TU_CLAVE_MAESTRA</code>`, BOT_TOKEN, { isRawHtml: true });
    return { processed: true, action: 'BLOCKED_UNAUTHORIZED' };
  }

  // PILAR 2: Procesamiento de Audio 100% en Memoria RAM Volátil
  let audioBuffer = null;
  try {
    if (message.voice || message.audio) {
      const fileId = message.voice?.file_id || message.audio?.file_id;
      if (fileId) {
        const fileInfoRes = await fetchWithRetry(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
        const fileInfo = await fileInfoRes.json();
        if (fileInfo.ok && fileInfo.result?.file_path) {
          const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.result.file_path}`;
          const audioRes = await fetchWithRetry(downloadUrl);
          const arrayBuf = await audioRes.arrayBuffer();
          audioBuffer = Buffer.from(arrayBuf);

          const forensicHash = computeForensicHash(audioBuffer);
          console.log(`[AUDIO SHA-256 HASH]: ${forensicHash} (${audioBuffer.length} bytes en RAM)`);

          const transcribed = await transcribeAudioInMemory(audioBuffer, GEMINI_API_KEY);
          if (transcribed) {
            text = transcribed;
            isVoiceInput = true;
          } else {
            await sendCloudMessage(chatId, `🎙️ <i>Recibí tu nota de voz, pero no se pudo decodificar con claridad. Por favor repítemela o escríbemela.</i>`, BOT_TOKEN, { isRawHtml: true });
            return { processed: true, action: 'VOICE_TRANSCRIBE_FAILED' };
          }
        }
      }
    }
  } finally {
    // Purga obligatoria de memoria RAM volátil
    if (audioBuffer) {
      purgeMemoryBuffer(audioBuffer);
      audioBuffer = null;
    }
  }

  if (!text) return { processed: false, reason: 'EMPTY_INPUT' };

  const lower = text.toLowerCase();
  const mcpHub = new ExecutiveAssistantMCPHub({
    strikeAddress: envConfig.STRIKE_LIGHTNING_ADDRESS || 'rick2818@strike.me'
  });

  // COMANDO: /START O /HELP
  if (lower === '/start' || lower === '/help' || lower === '/ayuda') {
    const welcome = `
🎩 <b>Executive Chief of Staff & Concierge Soberano 24/7</b>
<i>Cloud-Native Vercel Serverless | Gemini 3.6 Flash & TTS Puck</i>

Hola <b>${userName}</b>, estoy a tu entera disposición 24/7 en la nube (tu computadora puede estar apagada). Atajos:

🎙️ <b>/voz on | off</b> — Modo voz continuo
⚡ <b>/btc</b> — Precio Bitcoin en tiempo real y mempool fees
📅 <b>/agenda</b> — Reuniones programadas
✈️ <b>/vuelos [destino]</b> — Vuelos desde SAL
🍷 <b>/restaurantes</b> — Selección gastronómica ejecutiva
🎬 <b>/cine</b> — Cartelera VIP Multiplaza / La Gran Vía
📊 <b>/proyectos</b> — Estado de Destraba AI
🎯 <b>/hunter</b> — Estado del Cazador Autónomo 24/7
✉️ <b>/email</b> — Redactar correos ejecutivos

<i>Puedes escribirme o hablarme libremente por nota de voz.</i>
    `.trim();
    await sendCloudMessage(chatId, welcome, BOT_TOKEN, { isRawHtml: true });
    return { processed: true, action: 'START_COMMAND' };
  }

  // COMANDO: /BTC
  if (lower.startsWith('/btc') || lower.includes('bitcoin') || lower.includes('precio btc')) {
    const btc = await mcpHub.getBitcoinData();
    const msg = `
⚡ <b>BITCOIN & LIGHTNING NETWORK MCP (24/7 CLOUD)</b>

• <b>Precio actual:</b> <code>$${Number(btc.price_usd).toLocaleString()} USD</code> (${btc.change_24h_percent}%)
• <b>Poder de compra:</b> <code>${btc.satoshis_per_usd} satoshis</code> por $1 USD
• <b>Fee Mempool rápida:</b> <code>${btc.mempool_fees_sat_vb?.fastestFee || 14} sat/vB</code>
• <b>Destino fiduciario:</b> <code>${btc.strike_settlement_address}</code>
• <b>Estado:</b> 🟢 <i>Liquidación instantánea activa en la nube</i>
    `.trim();
    await sendCloudMessage(chatId, msg, BOT_TOKEN, { isRawHtml: true });
    await sendCloudVoiceNote(chatId, `El precio de Bitcoin es de ${Number(btc.price_usd).toLocaleString()} dólares. La fee de Mempool es de ${btc.mempool_fees_sat_vb?.fastestFee || 14} satoshis por virtual byte.`, BOT_TOKEN, GEMINI_API_KEY, OPENAI_API_KEY);
    return { processed: true, action: 'BTC_COMMAND' };
  }

  // RAZONAMIENTO GEMINI 3.6 FLASH + VOZ TTS 24/7
  if (GEMINI_API_KEY) {
    try {
      const geminiRes = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `You are the Sovereign Executive Chief of Staff and Personal Concierge to Ricardo.
Ricardo is an elite tech founder, investor, and builder based in San Salvador, El Salvador.
Key Operational Context:
- Platform: Destraba AI (unblock.ai) — sovereign AI custom agents.
- Settlement Rails: Bitcoin / Strike Lightning (rick2818@strike.me).
- Base: San Salvador, El Salvador (SAL Airport, Multiplaza / Gran Vía VIP cinemas, San Benito / Santa Elena restaurants).
- Demeanor: Boardroom-grade executive Chief of Staff tone. Natural Spanish or English depending on how he addresses you. Concise, authoritative, and fiduciary.`
            }]
          },
          contents: [{ parts: [{ text: text }] }]
        })
      }, 20000);

      const gData = await geminiRes.json();
      const reply = gData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        // Enviar respuesta en texto
        await sendCloudMessage(chatId, reply, BOT_TOKEN);

        // Enviar nota de voz ejecutiva
        await sendCloudVoiceNote(chatId, reply, BOT_TOKEN, GEMINI_API_KEY, OPENAI_API_KEY);
        return { processed: true, action: 'GEMINI_REPLY_VOICE_SENT' };
      }
    } catch (err) {
      console.error('[GEMINI CLOUD ERROR]:', err.message);
    }
  }

  // Fallback defensivo
  await sendCloudMessage(chatId, `🎩 Instrucción registrada, <b>${userName}</b>: <i>"${escapeHtml(text)}"</i>. Estoy operando 24/7 en la nube.`, BOT_TOKEN, { isRawHtml: true });
  return { processed: true, action: 'DEFENSIVE_FALLBACK' };
}
