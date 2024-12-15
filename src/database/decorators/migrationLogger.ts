import winston from 'winston';
import path from 'path';

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  const filename = path.basename(__filename);
  return `${timestamp} [${level}] ${filename} - ${message}`;
});

export const migrationsLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), customFormat),
  transports: [
    new winston.transports.File({ filename: path.resolve(__dirname, '../logs/migrations.log') }),
    new winston.transports.Console(),
  ],
});

export const MigrationLogger = (
  target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<any>,
) => {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    const migrationName = path.basename(module.filename, '.ts');
    migrationsLogger.info(
      `Migration ${migrationName}_${propertyKey} started...`,
    );

    await originalMethod.apply(this, args);

    migrationsLogger.info(
      `Migration ${migrationName}_${propertyKey} finished...`,
    );
  };
};
