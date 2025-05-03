import { Knex } from 'knex';
import { MigrationLogger, migrationsLogger } from '@decorators';

export class Migration {
  @MigrationLogger
  static async up(knex: Knex): Promise<void> {
    await knex.transaction(async transaction => {
      try {
        const isTableExists = await transaction.schema.hasTable('crmusers');
        if (isTableExists) {
          migrationsLogger.warn('Table crmusers already exists');
          return;
        }

        await transaction.schema.createTable('crmusers', table => {
          table
            .uuid('id')
            .primary()
            .defaultTo(transaction.raw('gen_random_uuid()'));
          table.string('email').unique().notNullable();
          table.string('password').notNullable();
          table.uuid('role_id').primary().notNullable();
          table.timestamp('created_at').defaultTo(transaction.fn.now());
          table.timestamp('updated_at').defaultTo(transaction.fn.now());
        });

        await transaction.commit();
        migrationsLogger.info('Table crmusers created');
      } catch (error) {
        migrationsLogger.error('Table crmusers not created');
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

        await transaction.schema.dropTable('crmusers');
        await transaction.commit();
        migrationsLogger.info('Table crmusers deleted');
      } catch (error) {
        migrationsLogger.error('Table crmusers not deleted');
        throw error;
      }
    });
  }
}

export const { up, down } = Migration;
