import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} from 'docx';

async function generateDoc() {
  const doc = new Document({
    title: "Protocolo Fiduciario Maestro de Tracción B2B - Boltech Group",
    description: "Integración End-to-End: Apollo.io + Motor Dual + Explee + Cadencias + Airtable + Auto-Mejora 24/7",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: [
          // Encabezado Corporativo
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "BOLTECH GROUP",
                bold: true,
                size: 32,
                color: "1E293B",
                font: "Calibri"
              }),
              new TextRun({
                text: " • AUTONOMOUS ENTERPRISE AI AGENTS",
                bold: true,
                size: 24,
                color: "0284C7",
                font: "Calibri"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "PROTOCOLO FIDUCIARIO MAESTRO DE TRACCIÓN B2B, OBSERVABILIDAD Y CIERRE DESATENDIDO",
                bold: true,
                size: 26,
                color: "0F172A",
                font: "Calibri"
              }),
              new TextRun({
                text: "\nIntegración End-to-End: Apollo.io API + Motor Dual + Explee Engine + Cadencia de 3 Impactos + Airtable Sync + Auto-Mejora 24/7",
                italics: true,
                size: 20,
                color: "64748B",
                font: "Calibri"
              })
            ]
          }),

          // Axioma Maestro
          new Paragraph({
            spacing: { after: 300 },
            shading: {
              type: ShadingType.CLEAR,
              fill: "F1F5F9"
            },
            children: [
              new TextRun({
                text: "💎 AXIOMA MAESTRO FUNDACIONAL (IMPERATIVO SUPREMO):\n",
                bold: true,
                size: 20,
                color: "0F172A",
                font: "Calibri"
              }),
              new TextRun({
                text: "«SIN CLIENTES NO HAY INGRESOS, Y SIN INGRESOS NO HAY TRABAJO.»\n",
                bold: true,
                italics: true,
                size: 22,
                color: "0369A1",
                font: "Calibri"
              }),
              new TextRun({
                text: "Todo agente, arquitectura técnica, script de software, correo electrónico y flujo automatizado existe con un único propósito fiduciario irrenunciable: adquirir, deleitar, cerrar y retener clientes de pago reales para generar flujo de caja recurrente en USD con cero fricción.",
                size: 20,
                color: "334155",
                font: "Calibri"
              })
            ]
          }),

          // Sección 1: Visión General y Flujo
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "1. Flujo Integrado de Tracción y Cierre Desatendido",
                bold: true,
                size: 24,
                color: "0284C7",
                font: "Calibri"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "El ecosistema opera mediante una cadena continua de 6 componentes de alta precisión que convierten dominios corporativos en clientes de pago en USD sin requerir llamadas en frío ni presentaciones de ventas manuales:",
                size: 21,
                color: "334155",
                font: "Calibri"
              })
            ]
          }),

          // Tabla de Componentes
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "0284C7" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Fase / Componente", bold: true, color: "FFFFFF", font: "Calibri" })] })]
                  }),
                  new TableCell({
                    shading: { fill: "0284C7" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Tecnología / Motor", bold: true, color: "FFFFFF", font: "Calibri" })] })]
                  }),
                  new TableCell({
                    shading: { fill: "0284C7" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Función Operativa Fiduciaria", bold: true, color: "FFFFFF", font: "Calibri" })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1. Extracción & Filtro", bold: true, font: "Calibri" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Apollo.io API + Zero-Bounce", font: "Calibri" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Extracción de decisores técnicos (CTO, CISO, COO) con validación DNS/MX en RAM.", font: "Calibri" })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2. Diagnóstico Dual", bold: true, font: "Calibri" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Unblock AI Shield + Latency Engine", font: "Calibri" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Auditoría perimetral de cabeceras HTTP (15ms) + cálculo de horas perdidas por fricción.", font: "Calibri" })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3. Micro-Auditoría Visual", bold: true, font: "Calibri" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Explee Engine (45s)", font: "Calibri" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Video animado de 45 segundos con semáforo perimetral, fricción y los 5 Anclajes de Confianza.", font: "Calibri" })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "4. Cadencia Desatendida", bold: true, font: "Calibri" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3 Impactos sin Vocabulario de Ventas", font: "Calibri" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Despacho por SMTP autenticado enfocado en observabilidad, parches WAF y certificación.", font: "Calibri" })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "5. Cierre & Liquidación", bold: true, font: "Calibri" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Strike Lightning / Wompi / Stripe", font: "Calibri" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Liquidación en USD instantánea: Flash ($19), Pro ($69/mes), Enterprise ($490).", font: "Calibri" })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "6. Observabilidad & ML", bold: true, font: "Calibri" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Airtable Sync + Bucle 21:00 UTC", font: "Calibri" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Registro unificado en B2B_Pipeline_Master y optimización diaria de copys y filtros.", font: "Calibri" })] })] })
                ]
              })
            ]
          }),

          // Sección 2: Detalle de los 6 Pilares
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 150 },
            children: [
              new TextRun({
                text: "2. Detalle de los 6 Pilares Estratégicos",
                bold: true,
                size: 24,
                color: "0284C7",
                font: "Calibri"
              })
            ]
          }),

          // Pilar 1
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: "Pilar 1: Extracción Quirúrgica en Apollo.io & Validación Zero-Bounce en RAM\n", bold: true, size: 21, color: "0F172A", font: "Calibri" }),
              new TextRun({ text: "• Segmentación por stack tecnológico compatible: Node.js, React, Next.js, Shopify, WooCommerce y pasarelas de pago.\n• Filtro de decisores: CTO, CISO, COO, VP de Ingeniería, Head of IT y Directores de Operaciones.\n• Validación en memoria volátil RAM con deep-email-validator antes de tocar cualquier red externa, garantizando 0% de tasa de rebote.", size: 20, color: "334155", font: "Calibri" })
            ]
          }),

          // Pilar 2
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: "Pilar 2: Motor Dual de Observabilidad (Boltech Group)\n", bold: true, size: 21, color: "0F172A", font: "Calibri" }),
              new TextRun({ text: "• Canal 1 (Unblock AI Shield): Análisis perimetral no invasivo en 15 ms detectando vulnerabilidades en cabeceras HTTP (CSP, HSTS, X-Frame-Options, TLS).\n• Canal 2 (Custom Agents): Telemetría pública de latencia y estimación objetiva de horas hombre perdidas en procesos repetitivos (~8 a 12 horas semanales por departamento).", size: 20, color: "334155", font: "Calibri" })
            ]
          }),

          // Pilar 3
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: "Pilar 3: Generador de Micro-Auditorías Animadas Explee Engine (45s)\n", bold: true, size: 21, color: "0F172A", font: "Calibri" }),
              new TextRun({ text: "• Escena 1 (0-15s): Semáforo perimetral objetivo con los puntos ciegos detectados en el dominio del cliente.\n• Escena 2 (15-30s): Telemetría de fricción y proyección del costo oculto de la nómina reactiva.\n• Escena 3 (30-45s): Blueprint de solución llave en mano con los 5 Anclajes de Confianza (Cero invasión, micro-riesgo $19, garantía de 7 días, privacidad bancaria SOC-2 y ROI comprobable).", size: 20, color: "334155", font: "Calibri" })
            ]
          }),

          // Pilar 4
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: "Pilar 4: Cadencia Desatendida de 3 Impactos (Cero Vocabulario de Ventas)\n", bold: true, size: 21, color: "0F172A", font: "Calibri" }),
              new TextRun({ text: "• Impacto 1 (Día 1): [Observabilidad] Diagnóstico de resguardo perimetral y optimización de flujos con enlace al video de Explee.\n• Impacto 2 (Día 3): [Parche Técnico] Entrega del archivo de configuración WAF descargable y blueprint del agente.\n• Impacto 3 (Día 5): [Certificación Final] Resumen de salud operativa y enlace de autoconsulta gratuita permanente.", size: 20, color: "334155", font: "Calibri" })
            ]
          }),

          // Pilar 5
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: "Pilar 5: Cierre y Liquidación Fiduciaria SLA\n", bold: true, size: 21, color: "0F172A", font: "Calibri" }),
              new TextRun({ text: "• Plan Flash ($19 USD): Parche de remediación descargable en <30 segundos.\n• Plan Pro ($69 USD/mes): Despliegue de agente autónomo centinela en <15 minutos.\n• Plan Enterprise ($490 USD): Suite multi-agente a la medida para operaciones transfronterizas.\n• Rieles: Liquidación a Strike Lightning (rick2818@strike.me con 0% comisión), Wompi SV y puente Stripe.", size: 20, color: "334155", font: "Calibri" })
            ]
          }),

          // Pilar 6
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "Pilar 6: Sincronización en Airtable & Bucle de Auto-Mejora Continua (21:00 UTC)\n", bold: true, size: 21, color: "0F172A", font: "Calibri" }),
              new TextRun({ text: "• Airtable Cloud (B2B_Pipeline_Master): Registro unificado de cada prospecto, estado de auditoría, enlace de video generado y cobros liquidados.\n• Bucle Auto-ML: Cada noche a las 21:00 UTC, el sistema evalúa métricas de entrega (>98%), apertura (>45%) y respuesta (>15%), recalculando los filtros de Apollo y optimizando los guiones de Explee para el día siguiente.", size: 20, color: "334155", font: "Calibri" })
            ]
          }),

          // Sección 3: Metas Operativas Diarias
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "3. Metas y Rendimiento Operativo Diario",
                bold: true,
                size: 24,
                color: "0284C7",
                font: "Calibri"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: "• Volumen Diario: 35 a 50 directores B2B auditados y contactados por jornada hábil.\n• Tasa de Entrega en Bandeja Principal: > 98.4% (Cero Sandbox / Cero Spam).\n• Tasa de Apertura Proyectada: > 45%.\n• Tasa de Respuesta Calificada: > 15%.\n• Objetivo Financiero: $300 USD/día — $9,000 USD/mes de flujo de caja recurrente.", size: 20, color: "334155", font: "Calibri" })
            ]
          }),

          // Pie de Página Fiduciario
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: "Boltech Group • Documento Corporativo Oficial\n",
                bold: true,
                size: 18,
                color: "64748B",
                font: "Calibri"
              }),
              new TextRun({
                text: "https://boltech-group.vercel.app • rick2818@strike.me",
                italics: true,
                size: 18,
                color: "0284C7",
                font: "Calibri"
              })
            ]
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPathDocx = path.resolve('PROTOCOLO_FIDUCIARIO_MAESTRO_TRACCION_B2B_APOLLO_EXPLEE.docx');
  const outPathDoc = path.resolve('PROTOCOLO_FIDUCIARIO_MAESTRO_TRACCION_B2B_APOLLO_EXPLEE.doc');

  fs.writeFileSync(outPathDocx, buffer);
  fs.writeFileSync(outPathDoc, buffer);

  console.log(`✅ Documentos generados exitosamente:`);
  console.log(`   - ${outPathDocx}`);
  console.log(`   - ${outPathDoc}`);
}

generateDoc().catch(err => {
  console.error("Error generando doc:", err);
  process.exit(1);
});
