/**
 * Logging utility with security event tracking for C4C Campus
 * @module lib/logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: unknown;
}

/**
 * Format a log message with timestamp and metadata
 */
function formatLog(level: LogLevel, message: string, meta?: LogMeta): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

/**
 * Internal logging function
 */
function log(level: LogLevel, message: string, meta?: LogMeta): void {
  const formatted = formatLog(level, message, meta);
  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
}

/**
 * Logger instance with level-based methods
 */
export const logger = {
  /** Log debug message (development only) */
  debug: (message: string, meta?: LogMeta) => log('debug', message, meta),
  /** Log informational message */
  info: (message: string, meta?: LogMeta) => log('info', message, meta),
  /** Log warning message */
  warn: (message: string, meta?: LogMeta) => log('warn', message, meta),
  /** Log error message */
  error: (message: string, meta?: LogMeta) => log('error', message, meta),
};

/**
 * Log a security-related event for audit trail
 * @param eventType - Type of security event (e.g., 'UNAUTHORIZED_ACCESS', 'LOGIN_FAILED')
 * @param data - Additional event data
 */
export function logSecurityEvent(eventType: string, data: Record<string, unknown>): void {
  const securityData = {
    eventType,
    timestamp: new Date().toISOString(),
    ...data
  };
  logger.warn(`SECURITY_EVENT: ${eventType}`, securityData);
}

export default logger;
