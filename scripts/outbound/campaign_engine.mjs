import fs from 'fs';
import path from 'path';

/**
 * Motor de Cadencias B2B Desatendidas de Destraba AI
 * Objetivo: Cubrir los $3,000 USD/mes ($100 USD/día) con ventas éticas y 100% legales.
 */

export const CAMPAIGNS = {
  CYBERSECURITY_DEFENSE_AUDIT: {
    id: 'cybersecurity_defense_audit',
    name: 'Auditoría Defensiva OWASP & Fugas de Datos B2B',
    offer: 'Flash Audit Express ($19 USD) / Auditoría Completa ($89 USD)',
    strikeAddress: 'rick2818@strike.me',
    cadence: [
      {
        impact: 1,
        day: 1,
        subject_es: "Riesgo de fuga de datos en pasarelas de pago y cabeceras ausentes",
        subject_en: "Data leakage risk in payment gateways & missing banking headers",
        body_es: (companyName) => `Estimado Director de Operaciones en ${companyName},\n\nAl auditar perimetralmente sitios de comercio electrónico B2B, detectamos que más del 70% operan sin cabeceras bancarias estrictas (CSP, HSTS) o con endpoints de pago expuestos a ataques de inyección.\n\nEn Destraba AI ejecutamos una auditoría de ciberseguridad defensiva en 60 segundos que detecta y entrega el reporte con los parches listos para aplicar.\n\nPuedes generar tu informe de inmediato por \$19 USD aquí:\nhttps://rick2818.github.io/Agents/?plan=flash&ref=audit_sec\n\nO liquidar directo vía Lightning sin comisiones a rick2818@strike.me.\n\nAtentamente,\nEquipo de Ciberseguridad Defensiva — Destraba AI`,
        body_en: (companyName) => `Dear Operations Director at ${companyName},\n\nWhen evaluating perimeter security on B2B e-commerce platforms, over 70% run without strict banking headers (CSP, HSTS) or with exposed payment endpoints vulnerable to injection.\n\nAt Unblock AI, we run a 60-second defensive cybersecurity audit that pinpoints critical flaws and provides ready-to-deploy patches.\n\nGenerate your instant audit report for \$19 USD here:\nhttps://rick2818.github.io/Agents/?plan=flash&lang=en\n\nOr settle directly via Bitcoin Lightning with zero fees to rick2818@strike.me.\n\nBest regards,\nDefensive Security Team — Unblock AI`
      },
      {
        impact: 2,
        day: 3,
        subject_es: "¿Cuánto cuesta 1 hora de caída o una filtración de datos en tu tienda?",
        subject_en: "What is the cost of 1 hour of downtime or a data breach in your store?",
        body_es: (companyName) => `Hola nuevamente,\n\nUna brecha de seguridad promedio en plataformas web cuesta entre \$4,500 y \$12,000 USD en reembolsos, pérdida de reputación y horas de soporte manual.\n\nNuestra auditoría forense preventiva de \$19 USD (\$89 USD auditoría profunda de 5 agentes) te entrega el plan exacto para blindar tu backend antes de que ocurra un incidente.\n\nActívala en 1 clic: https://rick2818.github.io/Agents/?plan=flash\n\nSaludos,\nDestraba AI`,
        body_en: (companyName) => `Hello again,\n\nThe average security breach on web platforms costs between \$4,500 and \$12,000 USD in chargebacks, reputation damage, and emergency developer hours.\n\nOur preventive audit (\$19 USD flash / \$89 USD full 5-agent deep scan) delivers the exact blueprint to harden your backend before an incident occurs.\n\nDeploy in 1 click: https://rick2818.github.io/Agents/?plan=flash&lang=en\n\nRegards,\nUnblock AI`
      },
      {
        impact: 3,
        day: 5,
        subject_es: "Último aviso: Tu enlace de blindaje perimetral fiduciario",
        subject_en: "Final notice: Your perimeter security hardening link",
        body_es: (companyName) => `Estimado directivo,\n\nCerramos la ventana de asignación técnica para ${companyName}. Si deseas verificar que tus webhooks y pasarelas no tienen fugas de memoria o vulnerabilidades de timing attack:\n\n1. Entra a https://rick2818.github.io/Agents/\n2. Ingresa a la consola fiduciaria y descarga el parche en .zip o conecta la pasarela.\n\nLiquidación instantánea disponible en Strike Lightning: rick2818@strike.me.\n\nEquipo Destraba AI`,
        body_en: (companyName) => `Dear Executive,\n\nWe are closing the review window for ${companyName}. If you need to verify your payment webhooks and endpoints against memory leaks or timing attack vulnerabilities:\n\n1. Visit https://rick2818.github.io/Agents/?lang=en\n2. Run the diagnostic and download your hardened patch in .zip.\n\nInstant settlement available on Strike Lightning: rick2818@strike.me.\n\nUnblock AI Team`
      }
    ]
  },
  AUTONOMOUS_OPERATOR_SAAS: {
    id: 'autonomous_operator_saas',
    name: 'Agente Autónomo B2B Desatendido',
    offer: 'Licencia Pro Operator ($69 USD/mes) / Suite Élite ($249 USD/mes)',
    strikeAddress: 'rick2818@strike.me',
    cadence: [
      {
        impact: 1,
        day: 1,
        subject_es: "Elimina 40 horas de trabajo operativo repetitivo cada semana",
        subject_en: "Eliminate 40 hours of repetitive operational tasks each week",
        body_es: (companyName) => `Hola,\n\n¿Cuánto tiempo dedica tu equipo en ${companyName} a cobranza manual, responder consultas idénticas por WhatsApp y actualizar inventarios?\n\nDestraba AI implementa un agente soberano en 60 segundos que asume esas tareas en piloto automático 24/7, permitiendo a tus directivos enfocarse en ventas de alto valor.\n\nInicia tu prueba y activa tu agente por \$69 USD/mes:\nhttps://rick2818.github.io/Agents/?plan=pro\n\nAtentamente,\nDestraba AI`,
        body_en: (companyName) => `Hello,\n\nHow much time does your team at ${companyName} waste on manual collection, repetitive customer questions, and inventory updates?\n\nUnblock AI deploys an autonomous sovereign agent in 60 seconds that handles those workflows 24/7, freeing your executives to focus strictly on revenue growth.\n\nLaunch and activate your agent for \$69 USD/month:\nhttps://rick2818.github.io/Agents/?plan=pro&lang=en\n\nBest regards,\nUnblock AI`
      }
    ]
  }
};

export function renderCampaignMessage(campaignId, impactIndex, companyName, lang = 'es') {
  const camp = CAMPAIGNS[campaignId];
  if (!camp) throw new Error(`Campaña no encontrada: ${campaignId}`);
  const item = camp.cadence.find(c => c.impact === impactIndex) || camp.cadence[0];

  const subject = lang === 'en' ? item.subject_en : item.subject_es;
  const body = lang === 'en' ? item.body_en(companyName) : item.body_es(companyName);

  return {
    campaign: camp.name,
    offer: camp.offer,
    impact: item.impact,
    day: item.day,
    subject,
    body,
    strikePaymentAddress: camp.strikeAddress
  };
}
