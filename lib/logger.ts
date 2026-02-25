import pino from 'pino';

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    env: process.env.NODE_ENV,
  },
});

type LogContext = Record<string, unknown>;

function makeMethod(fn: (obj: LogContext, msg: string) => void) {
  return (ctxOrMsg: LogContext | string, msgOrCtx?: string | LogContext) => {
    if (typeof ctxOrMsg === 'string') {
      // logger.info('message', { ctx })
      fn((msgOrCtx as LogContext) ?? {}, ctxOrMsg);
    } else {
      // logger.info({ ctx }, 'message')
      fn(ctxOrMsg, (msgOrCtx as string) ?? '');
    }
  };
}

export const logger = {
  info:  makeMethod((obj, msg) => pinoLogger.info(obj, msg)),
  error: makeMethod((obj, msg) => pinoLogger.error(obj, msg)),
  warn:  makeMethod((obj, msg) => pinoLogger.warn(obj, msg)),
  debug: makeMethod((obj, msg) => pinoLogger.debug(obj, msg)),
};
