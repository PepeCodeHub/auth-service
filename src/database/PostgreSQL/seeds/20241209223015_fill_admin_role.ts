import { Knex } from 'knex';
import { MigrationLogger, migrationsLogger } from '../../decorators';

export class Seed {
  @MigrationLogger
  static async seed(knex: Knex): Promise<void> {
    await knex.transaction(async transaction => {
      try {
        const permissions = await transaction('permissions').select('id');
        const permissionIds = permissions.map(permission => permission.id);

        await transaction('roles').insert({
          name: 'admin',
          description: 'Administrator role with full access',
          permission_ids: permissionIds,
          is_active: false,
          created_at: new Date(),
          updated_at: new Date(),
        });

        await transaction.commit();
        migrationsLogger.info('Admin role seeded');
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
        await transaction('roles').delete();
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        migrationsLogger.error(error);
        throw error;
      }
    });
  }
}

export const { seed, clear } = Seed;
