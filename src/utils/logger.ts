import winston from 'winston';
import path from 'path';

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  const filename = path.basename(__filename);
  return `${timestamp} [${level}] ${filename} - ${message}`;
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), customFormat),
  transports: [
    new winston.transports.File({ filename: './logs/auth-service.log' }),
    new winston.transports.Console(),
  ],
});
