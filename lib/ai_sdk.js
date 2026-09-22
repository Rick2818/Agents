/**
 * =============================================================================
 * BOLTECH GROUP — INTEGRACIÓN OFICIAL VERCEL AI SDK
 * =============================================================================
 * Soporte unificado para Google Gemini & OpenAI con Streaming, Function Calling
 * y Generación Estructurada (Zod / JSON Schema).
 * =============================================================================
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import {
  generateText as aiGenerateText,
  streamText as aiStreamText,
  generateObject as aiGenerateObject,
  streamObject as aiStreamObject
} from 'ai';

/**
 * Obtener cliente configurado de Google Generative AI
 */
export function getGoogleClient(customApiKey = null) {
  const apiKey = (customApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '').trim();
  return createGoogleGenerativeAI({
    apiKey: apiKey || 'dummy-key-for-init'
  });
}

/**
 * Obtener cliente configurado de OpenAI
 */
export function getOpenAIClient(customApiKey = null) {
  const apiKey = (customApiKey || process.env.OPENAI_API_KEY || '').trim();
  return createOpenAI({
    apiKey: apiKey || 'dummy-key-for-init'
  });
}

/**
 * Resuelve el modelo de lenguaje adecuado según el proveedor y configuración
 * @param {Object} options
 * @param {'google'|'openai'} [options.provider='google']
 * @param {string} [options.modelName]
 * @param {string} [options.apiKey]
 */
export function resolveLanguageModel(options = {}) {
  const provider = options.provider || 'google';
  const apiKey = options.apiKey;

  if (provider === 'openai') {
    const openai = getOpenAIClient(apiKey);
    const modelName = options.modelName || 'gpt-4o-mini';
    return openai(modelName);
  }

  // Predeterminado: Google Gemini (alineado con la arquitectura soberana de Boltech)
  const google = getGoogleClient(apiKey);
  const modelName = options.modelName || 'gemini-1.5-flash';
  return google(modelName);
}

/**
 * Diagnóstico de estado de claves y modelos para el Cockpit / API
 */
export function getAIProvidersStatus() {
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '').trim();
  const openAiKey = (process.env.OPENAI_API_KEY || '').trim();

  return {
    success: true,
    sdk: 'vercel-ai-sdk',
    providers: {
      google: {
        configured: Boolean(geminiKey && geminiKey.length > 5),
        defaultModel: 'gemini-1.5-flash',
        supportedModels: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash']
      },
      openai: {
        configured: Boolean(openAiKey && openAiKey.length > 5),
        defaultModel: 'gpt-4o-mini',
        supportedModels: ['gpt-4o-mini', 'gpt-4o']
      }
    }
  };
}

/**
 * Generación de texto síncrona
 */
export async function generateAIResponse({
  prompt,
  system = 'Eres el Asistente Ejecutivo de BolTech Group.',
  provider = 'google',
  modelName = null,
  apiKey = null,
  temperature = 0.7,
  maxTokens = 2048
}) {
  const model = resolveLanguageModel({ provider, modelName, apiKey });
  return await aiGenerateText({
    model,
    prompt,
    system,
    temperature,
    maxTokens
  });
}

/**
 * Flujo de streaming de texto
 */
export async function streamAIResponse({
  prompt,
  system = 'Eres el Asistente Ejecutivo de BolTech Group.',
  provider = 'google',
  modelName = null,
  apiKey = null,
  temperature = 0.7,
  maxTokens = 2048
}) {
  const model = resolveLanguageModel({ provider, modelName, apiKey });
  return await aiStreamText({
    model,
    prompt,
    system,
    temperature,
    maxTokens
  });
}

// Re-exportar primitivas del SDK para máxima extensibilidad
export {
  aiGenerateText as generateText,
  aiStreamText as streamText,
  aiGenerateObject as generateObject,
  aiStreamObject as streamObject
};
