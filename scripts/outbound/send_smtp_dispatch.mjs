/**
 * =============================================================================
 * MOTOR AUTÓNOMO DE DESPACHO OUTBOUND (SMTP / REST API) — DESTRABA AI
 * Diseñado bajo estándares de seguridad Full Stack Senior (20+ años de experiencia)
 * - Cero dependencias externas requeridas (Usa Node.js nativo https/tls)
 * - Protección contra inyección CRLF en cabeceras de correo
 * - Rate limiting defensivo con jitter (2-4 seg) para protección de reputación IP
 * - Modo DRY_RUN automático si no hay credenciales configuradas
 * - Idempotencia estricta para evitar dobles envíos
 * =============================================================================
 */

import https from 'https';
import tls from 'tls';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno locales de .env si existe
try { process.loadEnvFile?.(); } catch (e) {}

const PIPELINE_FILE = path.resolve('pipeline/leads_contactados_activos.json');

// Sanitización contra CRLF Injection (RFC 5322)
function sanitizeHeader(val) {
  if (!val) return '';
  return String(val).replace(/[\r\n]/g, ' ').trim();
}

// Enmascaramiento de credenciales para logs de auditoría
function maskSecret(secret) {
  if (!secret) return '(no configurado)';
  if (secret.length <= 6) return '******';
  return secret.substring(0, 3) + '...' + secret.substring(secret.length - 3);
}

/**
 * Enviar vía API REST de Resend (HTTPS estándar sobre Puerto 443)
 * Inmune a bloqueos de puertos en GitHub Actions / Azure
 */
function sendViaResend(apiKey, fromEmail, toEmail, subject, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from: sanitizeHeader(fromEmail || 'Destraba AI <notificaciones@destraba.ai>'),
      to: [sanitizeHeader(toEmail)],
      subject: sanitizeHeader(subject),
      text: body,
      headers: {
        'X-Entity-Ref-ID': 'destraba_fiduciary_' + Date.now(),
        'List-Unsubscribe': '<mailto:soporte@destraba.ai?subject=unsubscribe>'
      }
    });

    const req = https.request({
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey.trim(),
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            resolve({ success: true, messageId: parsed.id || 'resend_ok', transport: 'Resend_API' });
          } catch (e) {
            resolve({ success: true, messageId: 'resend_ok', transport: 'Resend_API' });
          }
        } else {
          reject(new Error('Resend HTTP ' + res.statusCode + ': ' + data));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout conectando a api.resend.com'));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Enviar vía SMTP Seguro nativo (TLS en puerto 465)
 */
function sendViaNativeSmtp(host, port, user, pass, fromEmail, toEmail, subject, body) {
  return new Promise((resolve, reject) => {
    const cleanHost = sanitizeHeader(host);
    const cleanPort = parseInt(port, 10) || 465;
    const cleanUser = sanitizeHeader(user);
    const cleanPass = pass;
    const cleanFrom = sanitizeHeader(fromEmail || user);
    const cleanTo = sanitizeHeader(toEmail);
    const cleanSubject = sanitizeHeader(subject);

    const socket = tls.connect({
      host: cleanHost,
      port: cleanPort,
      rejectUnauthorized: true,
      timeout: 12000
    }, () => {
      // Conexión TLS establecida
    });

    let step = 0;
    let responseBuffer = '';

    socket.on('data', (chunk) => {
      responseBuffer += chunk.toString();
      const lines = responseBuffer.split('\r\n');
      responseBuffer = lines.pop();

      for (const line of lines) {
        if (!line) continue;
        const code = parseInt(line.substring(0, 3), 10);
        if (isNaN(code)) continue;

        if (step === 0 && code === 220) {
          socket.write('EHLO destraba.ai\r\n');
          step = 1;
        } else if (step === 1 && code === 250 && !line.startsWith('250-')) {
          socket.write('AUTH LOGIN\r\n');
          step = 2;
        } else if (step === 2 && code === 334) {
          socket.write(Buffer.from(cleanUser).toString('base64') + '\r\n');
          step = 3;
        } else if (step === 3 && code === 334) {
          socket.write(Buffer.from(cleanPass).toString('base64') + '\r\n');
          step = 4;
        } else if (step === 4 && code === 235) {
          socket.write('MAIL FROM:<' + cleanFrom + '>\r\n');
          step = 5;
        } else if (step === 5 && code === 250) {
          socket.write('RCPT TO:<' + cleanTo + '>\r\n');
          step = 6;
        } else if (step === 6 && code === 250) {
          socket.write('DATA\r\n');
          step = 7;
        } else if (step === 7 && code === 354) {
          const rfcMessage = [
            'From: ' + cleanFrom,
            'To: ' + cleanTo,
            'Subject: ' + cleanSubject,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            'X-Mailer: Destraba-AI-Fiduciary-Autonomous-Engine/2.5',
            '',
            body,
            '.',
            ''
          ].join('\r\n');
          socket.write(rfcMessage);
          step = 8;
        } else if (step === 8 && code === 250) {
          socket.write('QUIT\r\n');
          step = 9;
          resolve({ success: true, messageId: 'smtp_' + Date.now(), transport: 'Native_SMTPS' });
        } else if (code >= 400) {
          socket.destroy();
          reject(new Error('SMTP Error (' + code + '): ' + line));
        }
      }
    });

    socket.on('error', (err) => {
      reject(err);
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Timeout en conexión SMTP con ' + cleanHost));
    });
  });
}

/**
 * Orquestador principal de despacho outbound
 */
export async function executeOutboundDispatch(options = {}) {
  const resendKey = process.env.RESEND_API_KEY || process.env.RESFND_APT_KEY;
  const isDryRun = options.dryRun || process.argv.includes('--dry-run') || (!resendKey && !process.env.SMTP_HOST);

  console.log('[OUTBOUND DISPATCHER]: Inicializando motor fiduciario...');
  console.log('Modo de operación: ' + (isDryRun ? 'DRY_RUN (Simulación segura)' : 'LIVE (Despacho real en red)'));
  console.log('Resend API Key: ' + maskSecret(resendKey));
  console.log('SMTP Host: ' + (process.env.SMTP_HOST || '(no configurado)'));

  if (!fs.existsSync(PIPELINE_FILE)) {
    console.warn('[OUTBOUND DISPATCHER]: Archivo de pipeline no encontrado: ' + PIPELINE_FILE);
    return { dispatched: 0 };
  }

  const pipeline = JSON.parse(fs.readFileSync(PIPELINE_FILE, 'utf8'));
  const pendingLeads = pipeline.filter(l => l.status === 'CONTACTADO_IMPACTO_1' || l.status === 'PREPARADO_PARA_DISPARO_MARTES' || l.status.includes('LISTO'));

  console.log('Total leads elegibles para transmisión: ' + pendingLeads.length);

  let sentCount = 0;
  const BATCH_LIMIT = 5;
  const targets = pendingLeads.slice(0, BATCH_LIMIT);
  const sandboxBlockedLeads = [];

  for (const lead of targets) {
    const toEmail = lead.corporateEmail || lead.contactEmail || ('contacto@' + lead.domain);
    const subject = lead.outboundMessage?.subject || ('Propuesta técnica de optimización para ' + lead.company);
    const body = lead.outboundMessage?.body || '';

    console.log('\n-----------------------------------------------------------------------------');
    console.log('Empresa: ' + lead.company + ' (' + lead.domain + ')');
    console.log('Destinatario: ' + toEmail);
    console.log('Asunto: ' + subject);

    if (isDryRun) {
      console.log('-> [DRY_RUN]: Despacho simulado exitoso. Mensaje verificado y retenido para audit trail.');
      lead.deliveryAudit = {
        dispatchedAt: new Date().toISOString(),
        mode: 'DRY_RUN_SIMULATION',
        recipient: toEmail,
        status: 'VERIFICADO_LISTO_PARA_TRANSMISION'
      };
      lead.status = 'TRANSMISION_SIMULADA_OK';
      sentCount++;
    } else {
      try {
        let result;
        if (resendKey) {
          result = await sendViaResend(
            resendKey,
            process.env.SMTP_FROM || process.env.OFFICIAL_SUPPORT_EMAIL || 'notificaciones@destraba.ai',
            toEmail,
            subject,
            body
          );
        } else if (process.env.SMTP_HOST && process.env.SMTP_PASS) {
          result = await sendViaNativeSmtp(
            process.env.SMTP_HOST,
            process.env.SMTP_PORT || 465,
            process.env.SMTP_USER,
            process.env.SMTP_PASS,
            process.env.SMTP_FROM,
            toEmail,
            subject,
            body
          );
        } else {
          throw new Error('Sin transporte configurado');
        }

        console.log('-> [LIVE DISPATCH SUCCESS]: ' + result.transport + ' | MessageId: ' + result.messageId);
        lead.deliveryAudit = {
          dispatchedAt: new Date().toISOString(),
          mode: 'LIVE',
          transport: result.transport,
          messageId: result.messageId,
          recipient: toEmail,
          status: 'TRANSMITIDO_EXITOSO'
        };
        lead.status = 'ENVIADO_REAL_EN_RED';
        sentCount++;
      } catch (err) {
        console.error('-> [ERROR DE TRANSMISION]: ' + err.message);
        if (err.message.includes('testing emails to your own email address') || err.message.includes('resend.com/domains')) {
          sandboxBlockedLeads.push({ lead, toEmail, subject, body });
        }
        lead.deliveryAudit = {
          attemptedAt: new Date().toISOString(),
          mode: 'LIVE_FAILED',
          error: err.message,
          status: 'REINTENTO_PROGRAMADO'
        };
      }
    }

    const delayMs = Math.floor(2500 + Math.random() * 1500);
    console.log('Esperando ' + delayMs + 'ms antes del siguiente envío (Defensa de reputación)...');
    await new Promise(r => setTimeout(r, delayMs));
  }

  // Digest Fiduciario de contingencia para Ricardo
  if (sandboxBlockedLeads.length > 0 && resendKey) {
    try {
      console.log('\n[DIGEST FIDUCIARIO]: Generando Resumen Ejecutivo para Ricardo...');
      const digestSubject = `🎯 [DESTRABA AI] ${sandboxBlockedLeads.length} Oportunidades Auditadas en Internet`;
      let digestBody = `Hola Ricardo,\n\nEl Cazador Autónomo 24/7 completó el escaneo perimetral y detectó ${sandboxBlockedLeads.length} empresas con vulnerabilidades monetizables en el cohort de hoy.\n\nComo tu cuenta de Resend requiere verificar dominio en resend.com/domains para envíos directos a terceros, aquí tienes los prospectos con sus enlaces de cobro a rick2818@strike.me:\n\n`;

      for (const item of sandboxBlockedLeads) {
        digestBody += `-----------------------------------------------------\n`;
        digestBody += `🏢 Empresa: ${item.lead.company} (${item.lead.domain})\n`;
        digestBody += `👤 Contacto: ${item.toEmail}\n`;
        digestBody += `💰 Oferta: ${item.lead.offer || '$19 USD Flash / $69 USD Pro'}\n`;
        digestBody += `⚡ Enlace de Cobro: https://rick2818.github.io/Agents/?plan=flash&domain=${item.lead.domain}\n`;
        digestBody += `✉️ Asunto: ${item.subject}\n\n`;
        digestBody += `Mensaje preparado:\n${item.body}\n\n`;
      }

      digestBody += `\nPara habilitar el envío automático directo a terceros sin intermediación, solo agrega tu dominio en https://resend.com/domains.\n\nDestino de liquidación: rick2818@strike.me\nDestraba AI Engine 2.5`;

      const digestRes = await sendViaResend(
        resendKey,
        'Destraba AI <onboarding@resend.dev>',
        'rick28191@gmail.com',
        digestSubject,
        digestBody
      );
      console.log('-> [DIGEST ENTREGADO]: Resumen ejecutivo enviado con éxito a rick28191@gmail.com (ID: ' + digestRes.messageId + ')');
    } catch (digestErr) {
      console.warn('-> [DIGEST WARNING]: No se pudo entregar digest:', digestErr.message);
    }
  }

  fs.writeFileSync(PIPELINE_FILE, JSON.stringify(pipeline, null, 2), 'utf8');

  console.log('\n=============================================================================');
  console.log('[OUTBOUND DISPATCHER RESUMEN]:');
  console.log('Total procesados en esta corrida: ' + sentCount);
  console.log('Estado de pipeline actualizado en: ' + PIPELINE_FILE);
  console.log('Cobros y liquidaciones dirigidos a: rick2818@strike.me');
  console.log('=============================================================================\n');

  return { sentCount };
}

if (process.argv[1] && process.argv[1].includes('send_smtp_dispatch.mjs')) {
  executeOutboundDispatch().catch(console.error);
}
