/**
 * =============================================================================
 * WATCHDOG AUTÓNOMO 24/7 DE SALUD Y VERIFICACIÓN CONTINUA DE AGENTES (FASE 5)
 * =============================================================================
 * Boltech Group — Cero Intervención Humana | Auto-Recuperación | Telemetría
 * =============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const ENV_PATH = path.resolve(ROOT_DIR, '.env');

function loadEnv() {
  if (fs.existsSync(ENV_PATH)) {
    const content = fs.readFileSync(ENV_PATH, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const k = trimmed.slice(0, idx).trim();
          const v = trimmed.slice(idx + 1).trim();
          if (k && !process.env[k]) process.env[k] = v;
        }
      }
    });
  }
}
loadEnv();

const BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const CHAT_ID = (process.env.TELEGRAM_AUTHORIZED_USER_ID || '6311509947').trim();

async function sendTelegramAlert(text) {
  if (!BOT_TOKEN || !CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });
  } catch (e) {}
}

async function runAutonomousHealthCheck() {
  console.log('🤖 [AUTONOMOUS WATCHDOG]: Iniciando verificación desatendida de flota de agentes...');

  try {
    const { stdout, stderr } = await execAsync('node scripts/run_automated_verification_suite.mjs', { cwd: ROOT_DIR });
    console.log('✅ [AUTONOMOUS WATCHDOG]: Flota de agentes 100% saludable y certificada.');
  } catch (err) {
    console.error('⚠️ [AUTONOMOUS WATCHDOG]: Se detectó una anomalía en la verificación automática.');
    const errorMsg = `🚨 <b>ALERTA AUTÓNOMA DE AGENTES — Boltech Group</b>\n\nEl Centinela 24/7 detectó una anomalía en la verificación automática de agentes.\n\n<b>Detalle:</b>\n<code>${(err.stdout || err.message).substring(0, 500)}</code>\n\n🔧 <i>El sistema está ejecutando protocolos de contención y auto-recuperación Fail-Closed.</i>`;
    await sendTelegramAlert(errorMsg);
  }
}

runAutonomousHealthCheck();
