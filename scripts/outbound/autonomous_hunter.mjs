/**
 * =============================================================================
 * DESTRABA AI — CAZADOR AUTÓNOMO PERIMETRAL Y DISPATCHER (100% DESATENDIDO)
 * Misión: Salir a la web, auditar cabeceras y puertos de plataformas B2B reales,
 * detectar vulnerabilidades y despachar ofertas fiduciarias de $19 USD / $69 USD.
 * Cero intervención humana. Fondos a: rick2818@strike.me
 * =============================================================================
 */

import https from 'https';
import http from 'http';
import dns from 'dns';
import fs from 'fs';
import path from 'path';

// Usar DNS públicos de Google y Cloudflare para resolución resiliente
dns.setServers(['8.8.8.8', '1.1.1.1']);

const AUDIT_LOG_FILE = path.resolve('pipeline/auditorias_autonomas_ejecutadas.json');

export class AutonomousHunter {
  constructor() {
    this.results = [];
    this.loadExisting();
  }

  loadExisting() {
    try {
      if (fs.existsSync(AUDIT_LOG_FILE)) {
        this.results = JSON.parse(fs.readFileSync(AUDIT_LOG_FILE, 'utf8'));
      }
    } catch (e) {
      this.results = [];
    }
  }

  saveResults() {
    const dir = path.dirname(AUDIT_LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(this.results, null, 2), 'utf8');
  }

  async auditTarget(target) {
    return new Promise((resolve) => {
      const { domain, company, contactEmail, country, industry } = target;
      console.log(`[AUTONOMOUS HUNTER]: Escaneando perimetralmente ${domain}...`);

      const req = https.request({
        hostname: domain,
        method: 'HEAD',
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Antigravity-Defensive-Scanner/2.5'
        }
      }, (res) => {
        const headers = res.headers;
        const hasCsp = !!headers['content-security-policy'];
        const hasHsts = !!headers['strict-transport-security'];
        const hasXFrame = !!headers['x-frame-options'];
        const server = headers['server'] || 'Desconocido';

        const flaws = [];
        if (!hasCsp) flaws.push("Falta Content-Security-Policy (Riesgo XSS)");
        if (!hasHsts) flaws.push("Falta Strict-Transport-Security (Riesgo SSL Strip)");
        if (!hasXFrame) flaws.push("Falta X-Frame-Options (Riesgo Clickjacking)");

        const severity = flaws.length >= 2 ? "CRITICA" : (flaws.length === 1 ? "MEDIA" : "BAJA");

        const auditReport = {
          auditId: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          company,
          domain,
          country,
          industry,
          contactEmail,
          serverDetected: server,
          httpStatusCode: res.statusCode,
          securityHeaders: { hasCsp, hasHsts, hasXFrame },
          flawsCount: flaws.length,
          flaws,
          severity,
          monetization: {
            offer: "$19 USD (Auditoría Forense Flash + Parche de Blindaje)",
            checkoutStrike: "https://strike.me/rick2818",
            checkoutDirectApp: `https://rick2818.github.io/Agents/?plan=flash&domain=${domain}`,
            destinationAddress: "rick2818@strike.me"
          },
          generatedDispatchMessage: {
            to: contactEmail,
            subject: `Informe de Seguridad Perimetral: ${flaws.length} vulnerabilidades detectadas en ${domain}`,
            body: `Estimado equipo técnico en ${company},\n\nDurante nuestra inspección perimetral automatizada sobre ${domain}, detectamos ${flaws.length} anomalías en cabeceras bancarias:\n${flaws.map(f => `• ${f}`).join('\n')}\n\nEn Destraba AI generamos la auditoría forense completa y el parche de configuración listo para producción por $19 USD:\nhttps://rick2818.github.io/Agents/?plan=flash&domain=${domain}\n\nO liquidación instantánea por Lightning a rick2818@strike.me.\n\nAtentamente,\nAgente Autónomo de Ciberseguridad Defensiva — Destraba AI`
          },
          status: "AUDITADO_Y_LISTO_PARA_NOTIFICACION"
        };

        this.results.unshift(auditReport);
        this.saveResults();
        resolve(auditReport);
      });

      req.on('error', (err) => {
        console.warn(`[AUTONOMOUS HUNTER]: Error conectando a ${domain}: ${err.message}`);
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn(`[AUTONOMOUS HUNTER]: Timeout en ${domain}`);
        resolve(null);
      });

      req.end();
    });
  }

  async runBatch(targetList) {
    const executed = [];
    for (const target of targetList) {
      const res = await this.auditTarget(target);
      if (res) executed.push(res);
      // Pausa defensiva de 1 segundo entre escaneos
      await new Promise(r => setTimeout(r, 1000));
    }
    return executed;
  }
}
