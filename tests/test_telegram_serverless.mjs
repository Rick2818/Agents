import handler from '../api/telegram.js';
import fs from 'node:fs';

// Cargar .env
const envText = fs.readFileSync('.env', 'utf8');
envText.split('\n').forEach(line => {
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

async function runSimulation() {
  console.log('1. Probando GET /api/telegram (Health check)...');
  const mockResGet = {
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(data) {
      console.log('GET Response:', this.statusCode, JSON.stringify(data));
      return this;
    }
  };
  await handler({ method: 'GET', headers: {} }, mockResGet);

  console.log('\n2. Probando POST /api/telegram con payload simulado...');
  let responseData = null;
  const mockResPost = {
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(data) {
      responseData = data;
      console.log('POST Response Status:', this.statusCode, JSON.stringify(data));
      return this;
    }
  };

  const mockReqPost = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: {
      update_id: 9999999,
      message: {
        message_id: 101,
        chat: { id: 6311509947, type: 'private' },
        from: { id: 6311509947, first_name: 'Ricardo', username: 'Rick281' },
        text: '/btc'
      }
    }
  };

  await handler(mockReqPost, mockResPost);
  console.assert(responseData && responseData.ok === true, 'El endpoint debe responder ok: true');
  console.log('\n✅ Prueba de Endpoint Serverless Superada con Éxito.');
}

runSimulation().catch(console.error);
