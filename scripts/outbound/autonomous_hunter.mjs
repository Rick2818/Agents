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
import { isBlacklisted } from '../../lib/compliance_dnc.js';

// Catálogo dinámico expandido de sectores de alta monetización B2B (Latinoamérica & España)
const DYNAMIC_TARGET_POOL = [
  // Sector 1: Finanzas, Facturación & Pagos
  { company: "Bold Pagos Colombia", domain: "bold.co", contactEmail: "soporte@bold.co", country: "Colombia", industry: "Fintech & Adquirencia" },
  { company: "Cobre Latam", domain: "cobre.co", contactEmail: "contacto@cobre.co", country: "Colombia / México", industry: "B2B Payment Rails" },
  { company: "Simetrik Finanzas", domain: "simetrik.com", contactEmail: "info@simetrik.com", country: "Latam / Global", industry: "Conciliación Financiera" },
  { company: "Addi Crédito y Pagos", domain: "co.addi.com", contactEmail: "soporte@addi.com", country: "Colombia", industry: "Fintech BNPL" },
  { company: "Clip México", domain: "clip.mx", contactEmail: "contacto@clip.mx", country: "México", industry: "Pagos Digitales" },
  { company: "Kushki Pagos", domain: "kushkipagos.com", contactEmail: "info@kushkipagos.com", country: "Ecuador / Latam", industry: "Pasarela de Pagos" },
  
  // Sector 2: Logística 3PL, Flota & Almacenes Fiscales
  { company: "Solistica FEMSA Logistics", domain: "solistica.com", contactEmail: "contacto@solistica.com", country: "México / Latam", industry: "Logística Integral 3PL" },
  { company: "Ransa Logística Integral", domain: "ransa.biz", contactEmail: "contacto@ransa.net", country: "Perú / Centroamérica", industry: "Operador Logístico 3PL" },
  { company: "Chazki Entregas Last Mile", domain: "chazki.com", contactEmail: "hola@chazki.com", country: "Perú / Colombia / México", industry: "Last Mile Fulfillment" },
  { company: "Moffin Automatización", domain: "moffin.mx", contactEmail: "contacto@moffin.mx", country: "México", industry: "Infraestructura B2B" },
  { company: "Liftit Carga y Fletes", domain: "liftit.co", contactEmail: "contacto@liftit.co", country: "Colombia / México", industry: "Logística y Transporte" },
  { company: "Clicoh Fulfillment", domain: "clicoh.com", contactEmail: "info@clicoh.com", country: "Latam Regional", industry: "Fulfillment E-commerce" },
  
  // Sector 3: Salud, Farma & Distribución Hospitalaria
  { company: "Droguerías Cafam Logística", domain: "cafam.com.co", contactEmail: "servicioalcliente@cafam.com.co", country: "Colombia", industry: "Distribución Farmacéutica" },
  { company: "Audifarma Logística Médica", domain: "audifarma.com.co", contactEmail: "contacto@audifarma.com.co", country: "Colombia", industry: "Cadena de Suministro Farma" },
  { company: "Nadro Distribución Farma", domain: "nadro.co", contactEmail: "contacto@nadro.mx", country: "México", industry: "Farma y Logística" },
  
  // Sector 4: Retail, Consumo Masivo & Proveeduría
  { company: "Alkosto Distribución Mayorista", domain: "alkosto.com", contactEmail: "sugerencias@alkosto.com.co", country: "Colombia", industry: "Retail & Cadena de Suministro" },
  { company: "El Rosado Corporativo", domain: "elrosado.com", contactEmail: "servicioalcliente@elrosado.com", country: "Ecuador", industry: "Supermercados & Logística" },
  { company: "Super Selectos El Salvador", domain: "superselectos.com", contactEmail: "contacto@superselectos.com", country: "El Salvador", industry: "Retail y Almacén" },
  { company: "EPA Ferreterías Regional", domain: "epaenlinea.com", contactEmail: "atencion@epaenlinea.com", country: "El Salvador / Guatemala", industry: "Distribución y Materiales" },
  { company: "Simán Corporativo", domain: "siman.com", contactEmail: "contacto@siman.com", country: "Centroamérica", industry: "Retail Departamental" }
];

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
    const { domain } = target;
    const hostsToTry = domain.startsWith('www.') ? [domain] : [domain, `www.${domain}`];

    for (const host of hostsToTry) {
      const res = await this._probeHost(host, target);
      if (res) return res;
    }
    return null;
  }

  _probeHost(hostname, target) {
    return new Promise((resolve) => {
      const { domain, company, contactEmail, country, industry } = target;
      console.log(`[AUTONOMOUS HUNTER]: Escaneando perimetralmente ${hostname}...`);

      const req = https.request({
        hostname,
        method: 'HEAD',
        timeout: 6000,
        rejectUnauthorized: false,
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

        // Detección proactiva de anomalías y vencimiento de certificados SSL
        const certAuthError = res.socket?.authorizationError;
        if (certAuthError) {
          flaws.push(`Certificado SSL Anómalo / Vencido: ${certAuthError}`);
        }

        const severity = flaws.length >= 2 ? "CRITICA" : (flaws.length === 1 ? "MEDIA" : "BAJA");

        const auditReport = {
          auditId: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          company,
          domain,
          scannedHost: hostname,
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
            offer: "$19 USD (Auditoría Forense Flash + Parche de Blindaje) / $69 USD (Agente Autónomo 24/7)",
            checkoutStrike: "https://strike.me/rick2818",
            checkoutDirectApp: `https://destraba-ai.vercel.app/?plan=flash&domain=${domain}`,
            destinationAddress: "rick2818@strike.me"
          },
          generatedDispatchMessage: {
            to: contactEmail,
            subject: `Informe de Seguridad Perimetral: ${flaws.length} vulnerabilidades detectadas en ${domain}`,
            body: `Estimado equipo directivo y técnico en ${company},\n\nDurante nuestra inspección perimetral automatizada sobre ${domain}, detectamos ${flaws.length} anomalías de seguridad y eficiencia operativa:\n${flaws.map(f => `• ${f}`).join('\n')}\n\nEn Destraba AI aplicamos el modelo de resolución ganar-ganar: generamos la auditoría forense completa y el parche de remediación listo para producción por solo $19 USD (o despliegue de agente autónomo 24/7 en la nube por $69 USD/mes con garantía de amortización en 7 días):\n🔗 https://destraba-ai.vercel.app/?plan=flash&domain=${domain}\n\nO liquidación instantánea sin comisiones vía Bitcoin Lightning Network a: rick2818@strike.me\n\nAtentamente,\nEspecialista Senior de Ciberseguridad & Ventas Fiduciarias — Destraba AI`
          },
          status: "AUDITADO_Y_LISTO_PARA_NOTIFICACION"
        };

        this.results.unshift(auditReport);
        this.saveResults();
        resolve(auditReport);
      });

      req.on('error', (err) => {
        console.warn(`[AUTONOMOUS HUNTER]: Error en ${hostname}: ${err.message}`);
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn(`[AUTONOMOUS HUNTER]: Timeout en ${hostname}`);
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

  /**
   * Filtro anti-fatiga de 90 días y verificación DNC
   */
  async isEligibleForAudit(domain, maxAgeDays = 90) {
    if (!domain) return false;
    const cleanDomain = domain.toLowerCase().trim();

    // 1. Chequeo DNC obligatorio
    if (await isBlacklisted(null, cleanDomain)) {
      return false;
    }

    // 2. Chequeo de última fecha de auditoría en pipeline
    const existing = this.results.find(r => r.domain?.toLowerCase() === cleanDomain);
    if (!existing) return true;

    const auditDate = new Date(existing.timestamp).getTime();
    if (isNaN(auditDate)) return true;

    const ageInDays = (Date.now() - auditDate) / (1000 * 60 * 60 * 24);
    return ageInDays >= maxAgeDays;
  }

  /**
   * Motor dinámico de descubrimiento: localiza nuevos prospectos no contactados recientemente
   */
  async discoverDynamicTargets({ limit = 5, sector = 'all' } = {}) {
    const eligible = [];
    const pool = [...DYNAMIC_TARGET_POOL];
    
    // Barajado pseudo-aleatorio para rotación fiduciaria
    pool.sort(() => Math.random() - 0.5);

    for (const candidate of pool) {
      if (eligible.length >= limit) break;
      if (sector !== 'all' && candidate.industry.toLowerCase() !== sector.toLowerCase()) continue;

      const canAudit = await this.isEligibleForAudit(candidate.domain);
      if (canAudit) {
        eligible.push(candidate);
      }
    }

    return eligible;
  }
}

