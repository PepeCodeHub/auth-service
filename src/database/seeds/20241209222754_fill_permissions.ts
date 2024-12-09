import { Knex } from 'knex';
import { MigrationLogger, migrationsLogger } from '../decorators';

export class Seed {
  @MigrationLogger
  static async seed(knex: Knex): Promise<void> {
    await knex.transaction(async transaction => {
      try {
        const permissions = [
          { name: 'read', description: 'Read permission' },
          { name: 'write', description: 'Write permission' },
          { name: 'delete', description: 'Delete permission' },
        ];

        for (const permission of permissions) {
          const existingPermission = await transaction('permissions')
            .where({ name: permission.name })
            .first();

          if (!existingPermission) {
            await transaction('permissions').insert({
              ...permission,
              created_at: transaction.fn.now(),
              updated_at: transaction.fn.now(),
            });
          }
        }

        await transaction.commit();
        migrationsLogger.info('Permissions seeded');
      } catch (error) {
        await transaction.rollback();
        migrationsLogger.error(error);
        throw error;
      }
    });
  }

  @MigrationLogger
  static async clear(knex: Knex): Promise<void> {
    await knex.transaction(async transaction => {
      try {
        await transaction('permissions').delete();
        await transaction.commit();
        migrationsLogger.info('Permissions cleared');
      } catch (error) {
        await transaction.rollback();
        migrationsLogger.error(error);
        throw error;
      }
    });
  }
}

export const { seed, clear } = Seed;
