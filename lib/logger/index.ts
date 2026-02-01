import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

const transports: winston.transport[] = [
  // Always use console in Vercel/serverless (no file system)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

// Only add file transports in local development
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  try {
    transports.push(
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    );
  } catch (e) {
    // File system not available, skip
  }
}

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'thatjob' },
  transports,
});

export default logger;
