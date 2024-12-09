import { Knex } from 'knex';
import { MigrationLogger, migrationsLogger } from '../decorators';

export class Migration {
  @MigrationLogger
  static async up(knex: Knex): Promise<void> {
    await knex.transaction(async transaction => {
      try {
        const isTableExists = await transaction.schema.hasTable('users');
        if (isTableExists) {
          migrationsLogger.warn('Table users already exists');
          return;
        }

        await transaction.schema.createTable('users', table => {
          table
            .uuid('id')
            .primary()
            .defaultTo(transaction.raw('gen_random_uuid()'));
          table.string('email').unique().notNullable();
          table.string('password').notNullable();
          table.boolean('is_admin').defaultTo(false);
          table.timestamp('created_at').defaultTo(transaction.fn.now());
          table.timestamp('updated_at').defaultTo(transaction.fn.now());
        });
      } catch (error) {
        migrationsLogger.error('Table users not created');
        throw error;
      }
    });
  }

  @MigrationLogger
  static async down(knex: Knex): Promise<void> {
    try {
      await knex.transaction(async transaction => {
        const isTableExists = await transaction.schema.hasTable('users');
        if (!isTableExists) {
          migrationsLogger.warn('Table users does not exist');
          return;
        }

        await transaction.schema.dropTable('users');
        migrationsLogger.info('Table users deleted');
        await transaction.commit();
      });
    } catch (error) {
      migrationsLogger.error('Table users not deleted');
      throw error;
    }
  }
}

export const { up, down } = Migration;
