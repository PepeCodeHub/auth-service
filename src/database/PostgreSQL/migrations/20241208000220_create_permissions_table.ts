import { Knex } from 'knex';
import { MigrationLogger, migrationsLogger } from '@decorators';

export class Migration {
  @MigrationLogger
  static async up(knex: Knex): Promise<void> {
    await knex.transaction(async transaction => {
      try {
        const isTableExists = await transaction.schema.hasTable('permissions');
        if (isTableExists) {
          migrationsLogger.warn('Table permissions already exists');
          return;
        }

        await transaction.schema.createTable('permissions', table => {
          table
            .uuid('id')
            .primary()
            .defaultTo(transaction.raw('gen_random_uuid()'));
          table.string('name').unique().notNullable();
          table.string('description').notNullable();
          table.boolean('is_active').defaultTo(true);
          table.timestamp('created_at').defaultTo(transaction.fn.now());
          table.timestamp('updated_at').defaultTo(transaction.fn.now());
        });

        await transaction.commit();
        migrationsLogger.info('Table permissions created');
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
        const isTableExists = await transaction.schema.hasTable('permissions');
        if (!isTableExists) {
          migrationsLogger.warn('Table permissions does not exist');
          return;
        }

        await transaction.schema.dropTable('permissions');
        migrationsLogger.info('Table permissions deleted');
        await transaction.commit();
      } catch (error) {
        migrationsLogger.error(error);
        throw error;
      }
    });
  }
}

export const { up, down } = Migration;
