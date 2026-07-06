import 'server-only';

// ============================================================
// STRUCTURED LOGGER
// Outputs newline-delimited JSON to stdout.
// Never use console.log in application code — use this instead.
// ============================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function resolveActiveLevel(): LogLevel {
  const raw = process.env['LOG_LEVEL'];
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') return raw;
  return 'info';
}

const ACTIVE_LEVEL_PRIORITY = LEVEL_PRIORITY[resolveActiveLevel()];

export interface LogContext {
  [key: string]: unknown;
}

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child(bindings: LogContext): ILogger;
}

function emit(
  level: LogLevel,
  message: string,
  context?: LogContext,
  bindings?: LogContext,
): void {
  if (LEVEL_PRIORITY[level] < ACTIVE_LEVEL_PRIORITY) return;
  const entry: Record<string, unknown> = {
    level,
    time: new Date().toISOString(),
    msg: message,
    ...bindings,
    ...context,
  };
  process.stdout.write(JSON.stringify(entry) + '\n');
}

class Logger implements ILogger {
  private readonly bindings: LogContext;

  constructor(bindings: LogContext = {}) {
    this.bindings = bindings;
  }

  debug(message: string, context?: LogContext): void {
    emit('debug', message, context, this.bindings);
  }

  info(message: string, context?: LogContext): void {
    emit('info', message, context, this.bindings);
  }

  warn(message: string, context?: LogContext): void {
    emit('warn', message, context, this.bindings);
  }

  error(message: string, context?: LogContext): void {
    emit('error', message, context, this.bindings);
  }

  child(bindings: LogContext): ILogger {
    return new Logger({ ...this.bindings, ...bindings });
  }
}

export const logger: ILogger = new Logger();
