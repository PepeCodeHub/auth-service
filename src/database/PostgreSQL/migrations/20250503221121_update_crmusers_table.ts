import { Knex } from 'knex';
import { MigrationLogger, migrationsLogger } from '../../decorators';

export class Migration {
  @MigrationLogger
  
  static async up(knex: Knex): Promise<void> {
    await knex.transaction(async transaction => {
      try {
        const isTableExists = await transaction.schema.hasTable('crmusers');
        if (!isTableExists) {
          migrationsLogger.warn('Table crmusers not exists');
          return;
        }

        await transaction.schema.alterTable('crmusers', table => {
          table.boolean('is_active').defaultTo(true);
          table.boolean('is_deleted').defaultTo(false);
          table.timestamp('deleted_at').defaultTo(null);
        })

        await transaction.commit();
        migrationsLogger.info('Table crmusers updated');
      } catch (error) {
        migrationsLogger.error(error);
        throw error;
      }
    });
  }

  @MigrationLogger
  static async down(knex: Knex): Promise<void> {
    await knex.transaction(async transaction => {
      try {
        const isTableExists = await transaction.schema.hasTable('crmusers');
        if (!isTableExists) {
          migrationsLogger.warn('Table crmusers does not exist');
          return;
        }

        await transaction.schema.alterTable('crmusers', table => {
          table.dropColumn('is_active');
          table.dropColumn('is_deleted');
          table.dropColumn('deleted_at');
        });

        await transaction.commit();
        migrationsLogger.info('Table crmusers reverted');
      } catch (error) {
        migrationsLogger.error(error);
        throw error;
      }
    });
  }
}

export const { up, down } = Migration;