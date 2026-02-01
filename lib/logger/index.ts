// Simple logger that works in serverless environments
// Avoids winston file system issues with __dirname

const logLevel = process.env.LOG_LEVEL || 'info';

const log = (level: string, message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    service: 'thatjob',
    message,
    ...meta,
  };

  if (process.env.NODE_ENV === 'production') {
    // In production, use structured JSON logging
    console.log(JSON.stringify(logEntry));
  } else {
    // In development, use readable format
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta || '');
  }
};

export const logger = {
  error: (message: string, meta?: any) => log('error', message, meta),
  warn: (message: string, meta?: any) => log('warn', message, meta),
  info: (message: string, meta?: any) => log('info', message, meta),
  debug: (message: string, meta?: any) => log('debug', message, meta),
};

export default logger;
