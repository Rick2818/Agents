/**
 * =============================================================================
 * BOLTECH GROUP — MEMORIA DISTRIBUIDA SERVERLESS & RATE LIMITER: UPSTASH REDIS
 * =============================================================================
 * Idempotencia global fiduciaria sobre HTTP (Vercel Edge & Serverless Lambdas).
 * Conector: @upstash/redis SDK
 * =============================================================================
 */

import { Redis } from '@upstash/redis';

// Respaldo en memoria RAM local si Redis no está aprovisionado aún
const localRamCache = new Map();
const localRamExpiry = new Map();

/**
 * Obtener cliente autenticado de Upstash Redis
 */
export function getRedisClient() {
  const url = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

/**
 * Diagnóstico de estado de la caché distribuida
 */
export function getCacheStatus() {
  const url = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();
  const isConfigured = Boolean(url && token);

  return {
    success: true,
    engine: isConfigured ? 'upstash_redis_http' : 'in_memory_ram_fallback',
    sdk: '@upstash/redis',
    configured: isConfigured,
    localItemsCount: localRamCache.size,
    status: isConfigured ? 'DISTRIBUTED_EDGE_LIVE' : 'VOLATILE_RAM_STANDALONE'
  };
}

/**
 * Guardar clave con tiempo de expiración
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlSeconds=3600]
 */
export async function setDistributedCache(key, value, ttlSeconds = 3600) {
  const client = getRedisClient();

  if (client) {
    try {
      await client.set(key, JSON.stringify(value), { ex: ttlSeconds });
      return true;
    } catch (e) {
      console.warn('[Cache Warning] Fallo en Upstash Redis, recurriendo a RAM:', e.message);
    }
  }

  // Fallback seguro en RAM
  localRamCache.set(key, value);
  localRamExpiry.set(key, Date.now() + (ttlSeconds * 1000));
  return true;
}

/**
 * Recuperar clave
 * @param {string} key
 */
export async function getDistributedCache(key) {
  const client = getRedisClient();

  if (client) {
    try {
      const data = await client.get(key);
      if (data !== null && data !== undefined) {
        return typeof data === 'string' ? JSON.parse(data) : data;
      }
      return null;
    } catch (e) {
      console.warn('[Cache Warning] Error leyendo de Upstash Redis, verificando RAM:', e.message);
    }
  }

  // Fallback seguro en RAM
  const expiry = localRamExpiry.get(key);
  if (expiry && Date.now() > expiry) {
    localRamCache.delete(key);
    localRamExpiry.delete(key);
    return null;
  }

  return localRamCache.has(key) ? localRamCache.get(key) : null;
}

/**
 * Control de tasa de peticiones (Rate Limiter) distribuido entre lambdas de Vercel
 * @param {string} identifier - IP o ID de usuario
 * @param {number} limit - Límite de peticiones
 * @param {number} windowSeconds - Ventana en segundos
 */
export async function checkDistributedRateLimit(identifier, limit = 60, windowSeconds = 60) {
  const client = getRedisClient();
  const key = `ratelimit:${identifier}`;

  if (client) {
    try {
      const count = await client.incr(key);
      if (count === 1) {
        await client.expire(key, windowSeconds);
      }
      return {
        allowed: count <= limit,
        current: count,
        limit,
        ttl: await client.ttl(key)
      };
    } catch (e) {
      console.warn('[RateLimit Warning] Error en Upstash Redis, aplicando fallback:', e.message);
    }
  }

  // Fallback en RAM
  const now = Date.now();
  const record = localRamCache.get(key) || { count: 0, resetAt: now + (windowSeconds * 1000) };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + (windowSeconds * 1000);
  } else {
    record.count += 1;
  }
  localRamCache.set(key, record);

  return {
    allowed: record.count <= limit,
    current: record.count,
    limit,
    ttl: Math.max(0, Math.ceil((record.resetAt - now) / 1000))
  };
}
