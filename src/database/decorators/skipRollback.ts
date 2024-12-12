import { migrationsLogger } from './migrationLogger';

export const SkipRollback = (
  target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<any>,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  descriptor.value = async function (...args: any[]) {
    migrationsLogger.info('Rollback not implemented...');
  };
};
