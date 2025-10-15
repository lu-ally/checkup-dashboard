/**
 * Rate Limiting Middleware für API-Endpunkte
 * Verhindert Brute-Force-Angriffe und DDoS
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (usually IP address or user ID)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limited, false if allowed
   */
  check(identifier: string, limit: number, windowMs: number): { limited: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.store.get(identifier)

    if (!entry || now > entry.resetTime) {
      // Create new entry
      this.store.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      })
      return {
        limited: false,
        remaining: limit - 1,
        resetTime: now + windowMs
      }
    }

    // Increment count
    entry.count++

    if (entry.count > limit) {
      return {
        limited: true,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    return {
      limited: false,
      remaining: limit - entry.count,
      resetTime: entry.resetTime
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter()

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}

/**
 * Rate limit middleware
 * @param identifier - Unique identifier for rate limiting
 * @param limit - Number of requests allowed
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000 // 1 minute default
): { success: boolean; error?: string; headers: Record<string, string> } {
  const result = rateLimiter.check(identifier, limit, windowMs)

  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
  }

  if (result.limited) {
    return {
      success: false,
      error: 'Zu viele Anfragen. Bitte versuche es später erneut.',
      headers: {
        ...headers,
        'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
      }
    }
  }

  return {
    success: true,
    headers
  }
}

export default rateLimiter
