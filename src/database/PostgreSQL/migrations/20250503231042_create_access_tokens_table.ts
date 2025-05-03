import { Knex } from 'knex';
import { MigrationLogger, migrationsLogger } from '../../decorators';

export class Migration {
  @MigrationLogger
  static async up(knex: Knex): Promise<void> {
    await knex.transaction(async transaction => {
      try {
        const isTableExists = await transaction.schema.hasTable('access_tokens');
        if (isTableExists) {
          migrationsLogger.warn('Table access_tokens already exists');
          return;
        }

        await transaction.schema.createTable('access_tokens', table => {
          table
            .uuid('id')
            .primary()
            .defaultTo(transaction.raw('gen_random_uuid()'));
          table.uuid('user_id').notNullable();
          table.string('token').notNullable();
          table.timestamp('created_at').defaultTo(transaction.fn.now());
          table.timestamp('updated_at').defaultTo(transaction.fn.now());
        });

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
        const isTableExists = await transaction.schema.hasTable('access_tokens');
        if (!isTableExists) {
          migrationsLogger.warn('Table refreshtokens does not exist');
          return;
        }

        await transaction.schema.dropTable('access_tokens');
        await transaction.commit();
        migrationsLogger.info('Table access_tokens deleted');

      } catch (error) {
        migrationsLogger.error(error);
        throw error;
      }
    });
  }
}

export const { up, down } = Migration;