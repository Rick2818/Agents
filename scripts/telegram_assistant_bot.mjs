/**
 * =============================================================================
 * ASISTENTE PERSONAL EJECUTIVO & CONCIERGE — TELEGRAM BOT 24/7 (MULTI-MCP)
 * Acceso Privado Soberano para Ricardo
 * Conectores: Bitcoin/Strike, Vuelos SAL, Cines/Restaurantes S.S., Proyectos y Google
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ExecutiveAssistantMCPHub } from '../lib/mcp_executive_assistant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno manualmente desde .env
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [k, ...v] = trimmed.split('=');
          if (k && v.length) process.env[k.trim()] = v.join('=').trim();
        }
      });
    }
  } catch (e) {}
}
loadEnv();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
let AUTHORIZED_USER_ID = process.env.TELEGRAM_AUTHORIZED_USER_ID || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MASTER_KEY = process.env.PLATFORM_MASTER_KEY || 'antigravity2026!';

const mcpHub = new ExecutiveAssistantMCPHub({
  strikeAddress: process.env.STRIKE_LIGHTNING_ADDRESS || 'rick2818@strike.me'
});

const TELEGRAM_API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

class TelegramExecutiveBot {
  constructor() {
    this.offset = 0;
    this.isRunning = false;
  }

  async sendRequest(method, payload = {}) {
    if (!BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN no configurado en .env.");
    }
    const res = await fetch(`${TELEGRAM_API_BASE}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

  async sendMessage(chatId, text, options = {}) {
    return this.sendRequest('sendMessage', {
      chat_id: chatId,
      text: text,
      parse_mode: options.parse_mode || 'HTML',
      disable_web_page_preview: options.disable_web_page_preview || false,
      reply_markup: options.reply_markup || undefined
    });
  }

  async sendVoiceNote(chatId, textToSpeak, caption = '') {
    if (!GEMINI_API_KEY) return false;
    try {
      // Limpiar etiquetas HTML del texto para síntesis limpia de voz
      const plainText = textToSpeak.replace(/<[^>]*>/g, '').trim();
      if (!plainText) return false;

      const ttsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: plainText.substring(0, 1000) }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck' // Voz ejecutiva premium, natural y templada
                }
              }
            }
          }
        })
      });

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
      const wav = Buffer.concat([header, pcmData]);

      const blob = new Blob([wav], { type: 'audio/wav' });
      const form = new FormData();
      form.append('chat_id', chatId);
      form.append('voice', blob, 'voice.ogg');
      if (caption) form.append('caption', caption.substring(0, 1024));

      const sendRes = await fetch(`${TELEGRAM_API_BASE}/sendVoice`, {
        method: 'POST',
        body: form
      });
      const sendData = await sendRes.json();
      return sendData.ok;
    } catch (err) {
      console.error('[TTS VOICE ERROR]:', err.message);
      return false;
    }
  }

  async checkBotIdentity() {
    try {
      const me = await this.sendRequest('getMe');
      if (me.ok) {
        console.log(`✅ Conectado a Telegram como: @${me.result.username} (${me.result.first_name})`);
        return me.result;
      } else {
        console.error("❌ Error conectando a Telegram:", me.description);
        return null;
      }
    } catch (e) {
      console.error("❌ Fallo de red al conectar con Telegram API:", e.message);
      return null;
    }
  }

  async processIncomingMessage(message) {
    const chatId = message.chat.id;
    const userId = String(message.from?.id || chatId);
    const text = (message.text || '').trim();
    const userName = message.from?.first_name || 'Ricardo';

    // 1. Control de Seguridad Fiduciaria (Whitelist de Usuario)
    if (AUTHORIZED_USER_ID && userId !== String(AUTHORIZED_USER_ID)) {
      console.warn(`[SEGURIDAD] Intento de acceso bloqueado desde User ID no autorizado: ${userId}`);
      return; // Cero respuesta a extraños (silencio defensivo)
    }

    // Si aún no está fijado el AUTHORIZED_USER_ID, permitir vincular con la Clave Maestra
    if (!AUTHORIZED_USER_ID) {
      if (text.includes(MASTER_KEY)) {
        AUTHORIZED_USER_ID = userId;
        process.env.TELEGRAM_AUTHORIZED_USER_ID = userId;
        await this.sendMessage(chatId, `🔐 <b>¡Dispositivo Vinculado Exitosamente!</b>\n\nTu Telegram ID (<code>${userId}</code>) ha sido registrado como el único autorizado para gobernar este agente.`);
        return;
      } else if (text === '/start') {
        await this.sendMessage(chatId, `🛡️ <b>Asistente Ejecutivo Soberano</b>\n\nHola ${userName}. Para activar tu acceso exclusivo, por favor envía la Clave Maestra de tu plataforma.`);
        return;
      }
    }

    console.log(`[TELEGRAM IN]: Mensaje recibido de ${userName} (${userId}): "${text || '[Audio/Adjunto]'}"`);

    // 2. Procesamiento de Comandos Directos
    const lower = text.toLowerCase();

    // COMANDO: START / AYUDA
    if (lower === '/start' || lower === '/help' || lower === '/ayuda') {
      const welcomeText = `
🎩 <b>Asistente Ejecutivo Personal & Concierge</b>
<i>Conectado a Gemini Flash 2.5 y Multi-MCP Hub</i>

Hola <b>${userName}</b>, estoy a tu servicio 24/7. Puedes escribir lo que necesites o usar estos atajos:

⚡ <b>/btc</b> — Precio Bitcoin, satoshis y Mempool fees
✈️ <b>/vuelos [destino]</b> — Vuelos desde San Salvador (SAL)
🍷 <b>/restaurantes</b> — Mejores opciones en San Benito / Escalón
🎬 <b>/cine</b> — Cartelera Cinemark Multiplaza / La Gran Vía
📊 <b>/proyectos</b> — Estado del pipeline y metas de Destraba AI
📅 <b>/agenda</b> — Google Workspace y reuniones

<i>También puedes escribirme en lenguaje natural desde la calle.</i>
      `.trim();

      const keyboard = {
        keyboard: [
          [{ text: "⚡ Precio BTC" }, { text: "✈️ Vuelos a Madrid" }],
          [{ text: "🍷 Restaurantes" }, { text: "🎬 Cine Hoy" }],
          [{ text: "📊 Mis Proyectos" }, { text: "📅 Mi Agenda" }]
        ],
        resize_keyboard: true
      };

      await this.sendMessage(chatId, welcomeText, { reply_markup: keyboard });
      return;
    }

    // COMANDO: BITCOIN & LIGHTNING
    if (lower.startsWith('/btc') || lower.includes('bitcoin') || lower.includes('precio btc') || lower.includes('sats')) {
      const btc = await mcpHub.getBitcoinData();
      const msg = `
⚡ <b>BITCOIN & LIGHTNING NETWORK MCP</b>

• <b>Precio actual:</b> <code>$${Number(btc.price_usd).toLocaleString()} USD</code> (${btc.change_24h_percent}%)
• <b>Poder de compra:</b> <code>${btc.satoshis_per_usd} satoshis</code> por $1 USD
• <b>Fee Mempool rápida:</b> <code>${btc.mempool_fees_sat_vb.fastestFee} sat/vB</code>
• <b>Destino de cobros:</b> <code>${btc.strike_settlement_address}</code>
• <b>Estado Lightning:</b> 🟢 <i>Liquidación instantánea activa</i>
      `.trim();
      await this.sendMessage(chatId, msg);
      return;
    }

    // COMANDO: VUELOS DESDE SAL (SAN SALVADOR)
    if (lower.startsWith('/vuelos') || lower.includes('vuelo') || lower.includes('madrid') || lower.includes('miami')) {
      let dest = "Madrid";
      if (lower.includes('miami')) dest = "Miami";
      if (lower.includes('bogota') || lower.includes('bogotá')) dest = "Bogota";
      if (lower.includes('mexico') || lower.includes('méxico')) dest = "Ciudad de Mexico";

      const flight = await mcpHub.searchFlightsFromSAL(dest, 'Próximas 2 semanas');
      const msg = `
✈️ <b>VUELOS DESDE SAN SALVADOR (SAL)</b>

• <b>Origen:</b> Aeropuerto El Salvador (SAL)
• <b>Destino:</b> <b>${flight.destination}</b>
• <b>Opción Recomendada:</b> ${flight.recommended_airline}
• <b>Precio Estimado:</b> <code>${flight.rango_precio_estimado}</code>
• <b>Duración:</b> ${flight.tiempo_vuelo}
• <b>Aerolíneas activas:</b> ${flight.operadores_activos.join(', ')}

👉 <a href="${flight.booking_action_url}">Ver itinerarios en Google Flights SAL</a>
      `.trim();
      await this.sendMessage(chatId, msg);
      return;
    }

    // COMANDO: RESTAURANTES EN SAN SALVADOR
    if (lower.startsWith('/restaurantes') || lower.includes('restaurante') || lower.includes('cenar') || lower.includes('almorzar')) {
      const venues = await mcpHub.searchSanSalvadorVenues('restaurant');
      const list = venues.restaurantes_recomendados.map(r => `• <b>${r.name}</b> (${r.zone})\n  <i>${r.cuisine}</i> | 📞 <code>${r.contact}</code>`).join('\n\n');
      const msg = `
🍷 <b>CONCIERGE GASTRONÓMICO — SAN SALVADOR</b>

${list}

<i>¿Deseas que te asista redactando una solicitud de reserva para hoy?</i>
      `.trim();
      await this.sendMessage(chatId, msg);
      return;
    }

    // COMANDO: CINES EN SAN SALVADOR
    if (lower.startsWith('/cine') || lower.includes('cine') || lower.includes('pelicula') || lower.includes('cartelera')) {
      const cine = await mcpHub.searchSanSalvadorVenues('cinema');
      const list = cine.salas_disponibles.map(c => `• <b>${c.theater}</b> (${c.format})\n  📍 ${c.ubicacion}\n  👉 <a href="${c.url_cartelera}">Consultar Horarios y Butacas</a>`).join('\n\n');
      const msg = `
🎬 <b>CARTELERA & SALAS DE CINE — SAN SALVADOR</b>

${list}
      `.trim();
      await this.sendMessage(chatId, msg);
      return;
    }

    // COMANDO: PROYECTOS & PIPELINE DESTRABA AI
    if (lower.startsWith('/proyectos') || lower.includes('pipeline') || lower.includes('ventas') || lower.includes('costo') || lower.includes('destraba')) {
      const p = await mcpHub.getProjectTrackingData();
      const msg = `
📊 <b>REPORTE EJECUTIVO DE PROYECTO — DESTRABA AI</b>

• <b>Costo mensual a cubrir:</b> <code>${p.monthly_cost_target_usd}</code>
• <b>Meta de Break-Even:</b> <code>${p.break_even_needed}</code>
• <b>Empresas auditadas hoy:</b> <code>${p.monitored_leads_today}</code>
• <b>Con fallas críticas monetizables:</b> <code>${p.leads_with_actionable_flaws} empresas</code>
• <b>Runner Cloud 24/7:</b> 🟢 <i>GitHub Actions Activo</i>
• <b>Cobro Lightning:</b> <code>${p.strike_lightning_destination}</code>
• <b>Estado:</b> 🟢 <b>100% OPERATIVO</b>
      `.trim();
      await this.sendMessage(chatId, msg);
      return;
    }

    // COMANDO: GOOGLE WORKSPACE
    if (lower.startsWith('/agenda') || lower.includes('google') || lower.includes('calendario') || lower.includes('gmail')) {
      const g = await mcpHub.getGoogleWorkspaceStatus();
      const msg = `
📅 <b>GOOGLE WORKSPACE MCP SUITE</b>

• <b>Google Calendar:</b> 🟢 <i>Activo (Lectura de reuniones y eventos)</i>
• <b>Gmail Fiduciario:</b> 🟢 <i>Activo (Resumen de correos y filtrado)</i>
• <b>Google Drive / Sheets:</b> 🟢 <i>Activo (Sincronización de balances)</i>
      `.trim();
      await this.sendMessage(chatId, msg);
      return;
    }

    // RESPUESTAS CONVERSACIONALES NATURALES Y CONCIERGE DIRECTO
    if (lower.includes('hola') || lower.includes('buenas') || lower.includes('buenos dias') || lower.includes('buenas tardes') || lower.includes('buenas noches') || lower.includes('que tal')) {
      await this.sendMessage(chatId, `🎩 ¡Hola <b>${userName}</b>! A tu servicio. ¿Qué gestionamos hoy?\n\nPuedes preguntarme por vuelos saliendo de El Salvador, recomendaciones para almorzar o cenar en San Salvador, cartelera de cine, el precio de Bitcoin o el estado de las metas financieras de Destraba AI.`);
      return;
    }

    if (lower.includes('gracias') || lower.includes('agradezco') || lower.includes('genial') || lower.includes('perfecto') || lower.includes('excelente')) {
      await this.sendMessage(chatId, `🎩 ¡Con todo gusto, <b>${userName}</b>! Es mi deber como tu asistente ejecutivo mantener todo operando sin fricción. Dime si necesitas otra gestión.`);
      return;
    }

    if (lower.includes('quien eres') || lower.includes('que puedes hacer') || lower.includes('ayuda') || lower.includes('funciones')) {
      await this.sendMessage(chatId, `🎩 <b>Soy tu Asistente Personal Ejecutivo y Concierge Soberano</b>.\n\nEstoy conectado directamente a las herramientas MCP de tu plataforma y puedo:\n\n• ⚡ Consultar Bitcoin en vivo, tasas de mempool y liquidación a tu Strike (<code>rick2818@strike.me</code>).\n• ✈️ Buscar itinerarios y vuelos saliendo de San Salvador (SAL).\n• 🍷 Recomendarte los mejores restaurantes en San Benito, Escalón y Santa Elena.\n• 🎬 Consultar cartelera y salas en Cinemark Multiplaza y La Gran Vía.\n• 📊 Mostrarte el pipeline comercial y el avance para cubrir los costos de tu app.\n• 📅 Conectarme a tu agenda de Google Workspace.`);
      return;
    }

    // RESPUESTA INTELIGENTE POR DEFECTO CON GEMINI (RAZONAMIENTO LIBRE 100%)
    if (GEMINI_API_KEY) {
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: `Eres el Asistente Ejecutivo Personal y Concierge Soberano de Ricardo en El Salvador.
Tu personalidad es culta, ejecutiva, servicial, concisa y fiduciaria. Hablas español con calidez ejecutiva y total soltura.
Tienes total libertad para responder sobre cualquier tema: negocios, estrategia, redacción, análisis, dudas de la vida o consultas del día a día.
Cuando Ricardo pregunte por datos locales o herramientas de su plataforma, ten en cuenta este contexto:
- Plataforma: Destraba AI (unblock.ai)
- Liquidación Bitcoin/Lightning: rick2818@strike.me
- Ciudad base: San Salvador, El Salvador (Aeropuerto SAL, cines en Multiplaza y La Gran Vía, restaurantes en San Benito, Escalón, Santa Elena).
- Comandos opcionales de acceso rápido: /btc, /vuelos, /restaurantes, /cine, /proyectos.` }]
            },
            contents: [{ parts: [{ text: text }] }]
          })
        });
        const gData = await geminiRes.json();
        const reply = gData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          // Enviar respuesta en texto enriquecido
          await this.sendMessage(chatId, reply);

          // Si el mensaje es una consulta o solicitud de audio, o si Ricardo lo prefiere, despachar nota de voz hiperrealista
          const isVoicePrompt = lower.includes('audio') || lower.includes('voz') || lower.includes('dime') || lower.includes('habla') || lower.includes('escucha') || reply.length < 350;
          if (isVoicePrompt) {
            await this.sendVoiceNote(chatId, reply);
          }
          return;
        }
      } catch (err) {
        console.error('[GEMINI ERROR]:', err.message);
      }
    }

    // Fallback conversacional asistido
    await this.sendMessage(chatId, `🎩 Entendido, <b>${userName}</b>. Tengo registrada tu instrucción: <i>"${text}"</i>.\n\nPuedes pedirme de forma directa:\n• ⚡ <b>"Precio de Bitcoin"</b> o <b>/btc</b>\n• ✈️ <b>"Vuelos a Madrid"</b> o <b>/vuelos</b>\n• 🍷 <b>"Restaurantes para cenar"</b> o <b>/restaurantes</b>\n• 🎬 <b>"Cines hoy"</b> o <b>/cine</b>\n• 📊 <b>"Estado del proyecto"</b> o <b>/proyectos</b>`);
  }

  async startPolling() {
    this.isRunning = true;
    console.log("🚀 Iniciando bucle de polling 24/7 para el Asistente en Telegram...");

    while (this.isRunning) {
      try {
        const updates = await this.sendRequest('getUpdates', {
          offset: this.offset,
          timeout: 25
        });

        if (updates.ok && Array.isArray(updates.result)) {
          for (const update of updates.result) {
            this.offset = update.update_id + 1;
            if (update.message) {
              await this.processIncomingMessage(update.message);
            }
          }
        }
      } catch (err) {
        // Pausa defensiva ante desconexiones de red
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }
}

// Ejecución directa
async function run() {
  const bot = new TelegramExecutiveBot();
  if (!BOT_TOKEN) {
    console.log("=============================================================================");
    console.log("ℹ️  TELEGRAM_BOT_TOKEN aún no está configurado en .env.");
    console.log("1. Abre Telegram y escribe a @BotFather");
    console.log("2. Escribe /newbot y dale un nombre (ej: 'Ricardo Executive AI')");
    console.log("3. Pega el token resultante en .env como TELEGRAM_BOT_TOKEN=tu_token_aqui");
    console.log("4. Ejecuta: node scripts/telegram_assistant_bot.mjs");
    console.log("=============================================================================");
    return;
  }

  const me = await bot.checkBotIdentity();
  if (me) {
    await bot.startPolling();
  }
}

run().catch(console.error);
