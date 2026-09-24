/**
 * =============================================================================
 * SENSOR & WATCHDOG DE HOT LEADS — EXPLEE AUTOGTM
 * =============================================================================
 * Monitorea periódicamente las respuestas de alto interés de prospectos en
 * Explee AutoGTM. Cuando un prospecto responde positivamente pidiendo precios,
 * detalles o el parche:
 * 1. Extrae el texto íntegro de la respuesta ('why_hot').
 * 2. Despacha alerta prioritaria e inmediata al Telegram de Don Ricardo.
 * 3. Prepara el enlace fiduciario a Strike (rick2818@strike.me) y Unblock AI Shield.
 * 4. Actualiza el cursor inmutable 'since' para evitar alertas duplicadas.
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const EXPLEE_API_KEY = process.env.EXPLEE_API_KEY;
const EXPLEE_BASE_URL = 'https://api.explee.com/public/api/v1';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_AUTHORIZED_USER_ID || '6311509947';

const STATE_FILE = path.resolve('pipeline', 'explee_hot_leads_state.json');
const NOTIFIED_FILE = path.resolve('pipeline', 'explee_hot_leads_notified.json');

if (!EXPLEE_API_KEY) {
  console.error('❌ ERROR: EXPLEE_API_KEY no configurada en .env');
  process.exit(1);
}

/**
 * Cargar estado de última consulta (cursor 'since')
 */
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (e) {
      console.warn('⚠️ Error leyendo state file, reiniciando cursor.');
    }
  }
  return { last_poll: null, last_hot_at: null, total_hot_leads_seen: 0 };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function loadNotifiedList() {
  if (fs.existsSync(NOTIFIED_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(NOTIFIED_FILE, 'utf8'));
    } catch (e) {}
  }
  return [];
}

function saveNotifiedList(list) {
  fs.writeFileSync(NOTIFIED_FILE, JSON.stringify(list, null, 2), 'utf8');
}

/**
 * Envío de alerta a Telegram
 */
function sendTelegramNotification(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[TELEGRAM]: Bot token o Chat ID no configurados. Omitiendo mensaje en vivo.');
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const postData = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    const req = https.request({
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('📱 [TELEGRAM ALERT]: Notificación despachada con éxito.');
          resolve(true);
        } else {
          console.warn(`⚠️ [TELEGRAM ALERT]: Error HTTP ${res.statusCode}: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ [TELEGRAM ERROR]:', e.message);
      resolve(false);
    });
    req.write(postData);
    req.end();
  });
}

/**
 * Consulta de Hot Leads en Explee AutoGTM
 */
async function pollHotLeads() {
  const state = loadState();
  const notified = loadNotifiedList();
  
  let url = `${EXPLEE_BASE_URL}/autogtm/hot-leads?limit=50`;
  if (state.last_hot_at) {
    url += `&since=${encodeURIComponent(state.last_hot_at)}`;
  }

  console.log(`🔍 [EXPLEE HOT LEADS SENSOR]: Consultando ${url}...`);

  try {
    const res = await fetch(url, {
      headers: {
        'X-API-Key': EXPLEE_API_KEY
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const leads = data.leads || [];

    console.log(`📊 [EXPLEE HOT LEADS]: ${leads.length} leads calificados como 'Hot' recibidos.`);

    let newestHotAt = state.last_hot_at;

    for (const lead of leads) {
      const leadKey = `${lead.person_id}_${lead.became_hot_at}`;
      if (notified.includes(leadKey)) {
        console.log(`⏩ Lead ya notificado previamente: ${lead.email} (${lead.company_domain})`);
        continue;
      }

      console.log(`🔥 [NUEVO HOT LEAD]: ${lead.name || 'Contacto'} (${lead.email}) de ${lead.company_name || lead.company_domain}`);
      console.log(`💬 Motivo / Respuesta: "${lead.why_hot}"`);

      // Construir mensaje de alerta
      const alertMessage = 
`🚨🔥 *¡HOT LEAD CALIFICADO EN EXPLEE AUTOGTM!* 🔥🚨

🏢 *Empresa:* ${lead.company_name || 'N/A'} (\`${lead.company_domain || 'N/A'}\`)
👤 *Contacto:* ${lead.name || 'Director/Lead'} (${lead.job_title || 'Operations'})
📧 *Email:* \`${lead.email || 'N/A'}\`
📍 *País:* ${lead.country || 'Global'}
📞 *Teléfono:* \`${lead.phone || 'No disponible'}\`

💬 *Respuesta del Prospecto:*
_"${lead.why_hot || 'Interés comercial expresado'}"_

⚡ *Acción Rápida de Cierre:*
• Enlace de Cobro Flash (\$19 USD): https://boltech-group.vercel.app/#soluciones
• Enlace de Cobro Pro (\$69 USD): https://boltech-group.vercel.app/#soluciones
• Liquidación Lightning: rick2818@strike.me
• Auditoría en Vivo: https://unblock-shield.vercel.app/?domain=${lead.company_domain || ''}
• Respaldo LinkedIn Fundador: https://www.linkedin.com/in/ricbol/

_Liquidación fiduciaria en USD a rick2818@strike.me con cero retención en disco._`;

      await sendTelegramNotification(alertMessage);
      notified.push(leadKey);

      if (!newestHotAt || new Date(lead.became_hot_at) > new Date(newestHotAt)) {
        newestHotAt = lead.became_hot_at;
      }
    }

    // Actualizar estado
    state.last_poll = new Date().toISOString();
    if (newestHotAt) {
      state.last_hot_at = newestHotAt;
    }
    state.total_hot_leads_seen += leads.length;

    saveState(state);
    saveNotifiedList(notified);

    console.log('✅ Sondeo de Hot Leads completado con éxito.');
  } catch (err) {
    console.error('❌ Error consultando Hot Leads en Explee:', err.message);
  }
}

pollHotLeads();
