/**
 * Sicherer Logger für Production
 * Verhindert Logging sensibler Daten in Production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogOptions {
  level?: LogLevel
  context?: string
  metadata?: Record<string, unknown>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production'

  /**
   * Sanitize data before logging
   * Entfernt sensible Felder wie Passwörter, Tokens, etc.
   */
  private sanitize(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item))
    }

    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'apiKey',
      'api_key',
      'privateKey',
      'private_key',
      'accessToken',
      'refreshToken',
      'authorization'
    ]

    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase()
      const isSensitive = sensitiveKeys.some(sensitive =>
        lowerKey.includes(sensitive.toLowerCase())
      )

      if (isSensitive) {
        sanitized[key] = '***REDACTED***'
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  /**
   * Format log message
   */
  private format(level: LogLevel, message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString()
    const context = options?.context ? `[${options.context}]` : ''
    return `${timestamp} ${level.toUpperCase()} ${context} ${message}`
  }

  debug(message: string, options?: LogOptions): void {
    if (!this.isDevelopment) return

    const formatted = this.format('debug', message, options)
    console.debug(formatted, options?.metadata ? this.sanitize(options.metadata) : '')
  }

  info(message: string, options?: LogOptions): void {
    const formatted = this.format('info', message, options)

    if (this.isDevelopment) {
      console.info(formatted, options?.metadata ? this.sanitize(options.metadata) : '')
    } else {
      // In production: nur wichtige Info-Logs
      console.log(formatted)
    }
  }

  warn(message: string, options?: LogOptions): void {
    const formatted = this.format('warn', message, options)
    console.warn(formatted, options?.metadata ? this.sanitize(options.metadata) : '')
  }

  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    const formatted = this.format('error', message, options)

    if (error instanceof Error) {
      console.error(formatted, {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        metadata: options?.metadata ? this.sanitize(options.metadata) : undefined
      })
    } else {
      console.error(formatted, this.sanitize(error))
    }
  }

  /**
   * Log nur in Development
   */
  dev(message: string, data?: unknown): void {
    if (!this.isDevelopment) return
    console.log(`[DEV] ${message}`, data ? this.sanitize(data) : '')
  }
}

export const logger = new Logger()
