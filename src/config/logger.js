import winston from 'winston';
import env, { isProd } from './env.js';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    isProd ? json() : combine(colorize(), devFormat)
  ),
  defaultMeta: { service: 'dilbahar-api', env: env.nodeEnv },
  transports: [new winston.transports.Console()],
});

export default logger;
