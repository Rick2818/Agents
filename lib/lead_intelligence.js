/**
 * =============================================================================
 * BOLTECH GROUP — MOTOR DE INTELIGENCIA DE LEADS EN TIEMPO REAL: TAVILY
 * =============================================================================
 * Investigación web profunda de prospectos B2B para redacción hiperpersonalizada.
 * Conector: @tavily/core SDK
 * =============================================================================
 */

import { tavily } from '@tavily/core';

/**
 * Obtener cliente autenticado de Tavily
 */
export function getTavilyClient(customApiKey = null) {
  const apiKey = (customApiKey || process.env.TAVILY_API_KEY || '').trim();
  if (!apiKey) {
    return null;
  }
  return tavily({ apiKey });
}

/**
 * Diagnóstico de estado del motor de inteligencia
 */
export function getIntelligenceStatus() {
  const apiKey = (process.env.TAVILY_API_KEY || '').trim();
  const isConfigured = Boolean(apiKey && apiKey.length > 5);

  return {
    success: true,
    engine: 'tavily_search',
    sdk: '@tavily/core',
    configured: isConfigured,
    status: isConfigured ? 'OPERATIONAL_LIVE' : 'PENDING_TAVILY_KEY'
  };
}

/**
 * Investigar empresa o decisor antes de iniciar outreach
 * @param {string} query - Nombre de la empresa o persona (ej: 'Fintech El Salvador Banco Agricola API')
 * @param {Object} [options]
 * @param {'general'|'news'|'finance'} [options.topic='general']
 * @param {number} [options.maxResults=5]
 */
export async function researchCompanyOrLead(query, options = {}) {
  if (!query || typeof query !== 'string') {
    throw new Error('El término de búsqueda (query) es requerido para la investigación de leads.');
  }

  const client = getTavilyClient();

  if (!client) {
    return {
      success: true,
      query,
      simulated: true,
      results: [
        {
          title: `Simulación de Inteligencia para ${query}`,
          url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          content: `Perfil corporativo y presencia institucional en LATAM. Para resultados dinámicos en vivo, configura TAVILY_API_KEY en .env.`,
          score: 0.95
        }
      ],
      insights: `Investigación sintética en memoria RAM completada para: ${query}`
    };
  }

  try {
    const searchOptions = {
      searchDepth: options.searchDepth || 'basic',
      topic: options.topic || 'general',
      maxResults: options.maxResults || 5,
      includeAnswer: true
    };

    const response = await client.search(query, searchOptions);

    return {
      success: true,
      query,
      answer: response.answer || null,
      results: (response.results || []).map(r => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score
      })),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      query,
      error: error?.message || 'Error al ejecutar búsqueda con Tavily API'
    };
  }
}
