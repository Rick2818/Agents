/**
 * =============================================================================
 * BOLTECH GROUP — MOTOR DE MENSAJERÍA FIDUCIARIA: WHATSAPP BUSINESS & SMS
 * =============================================================================
 * Conversión de alta velocidad en LATAM (Centroamérica / México / Colombia).
 * Conector: Twilio SDK (WhatsApp Business API & SMS)
 * =============================================================================
 */

import twilio from 'twilio';

/**
 * Obtener cliente autenticado de Twilio
 */
export function getTwilioClient(accountSid = null, authToken = null) {
  const sid = (accountSid || process.env.TWILIO_ACCOUNT_SID || '').trim();
  const token = (authToken || process.env.TWILIO_AUTH_TOKEN || '').trim();

  if (!sid || !token) {
    return null;
  }

  return twilio(sid, token);
}

/**
 * Diagnóstico de estado del motor de WhatsApp
 */
export function getWhatsAppStatus() {
  const sid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const token = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const from = (process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886').trim();

  const isConfigured = Boolean(sid && token && sid.startsWith('AC'));

  return {
    success: true,
    channel: 'whatsapp_business',
    sdk: 'twilio',
    configured: isConfigured,
    fromNumber: from,
    status: isConfigured ? 'OPERATIONAL_LIVE' : 'PENDING_TWILIO_CREDENTIALS'
  };
}

/**
 * Despachar mensaje de WhatsApp fiduciario a un prospecto o cliente
 * @param {Object} options
 * @param {string} options.to - Número de destino (ej: '+50371234567' o 'whatsapp:+50371234567')
 * @param {string} options.body - Contenido del mensaje de texto
 * @param {string} [options.mediaUrl] - URL opcional de imagen, PDF o video demostrativo
 */
export async function sendWhatsAppMessage({ to, body, mediaUrl = null }) {
  if (!to || !body) {
    throw new Error('Los parámetros "to" y "body" son requeridos para enviar WhatsApp.');
  }

  const client = getTwilioClient();
  const normalizedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to.trim()}`;
  const defaultFrom = (process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886').trim();

  if (!client) {
    return {
      success: false,
      delivered: false,
      channel: 'whatsapp',
      recipient: normalizedTo,
      reason: 'TWILIO_ACCOUNT_SID o TWILIO_AUTH_TOKEN no configurados en entorno local.',
      simulated: true,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const payload = {
      from: defaultFrom,
      to: normalizedTo,
      body
    };

    if (mediaUrl) {
      payload.mediaUrl = [mediaUrl];
    }

    const message = await client.messages.create(payload);

    return {
      success: true,
      delivered: true,
      channel: 'whatsapp',
      sid: message.sid,
      status: message.status,
      to: message.to,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      delivered: false,
      channel: 'whatsapp',
      error: error?.message || 'Error al despachar mensaje de WhatsApp vía Twilio API',
      code: error?.code || 'TWILIO_API_ERROR'
    };
  }
}
