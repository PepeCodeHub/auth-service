import { Knex } from 'knex';
import { MigrationLogger, migrationsLogger } from '../../decorators';

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
          table.string('first_name').defaultTo('');
          table.string('last_name').defaultTo('');
          table.timestamp('date_of_birth').defaultTo(transaction.fn.now());
          table.string('phone_number').defaultTo('');
          table.string('address').defaultTo('');
          table.string('city').defaultTo('');
          table.string('state').defaultTo('');
          table.string('zip').defaultTo('');
          table.string('country').defaultTo('');
          table.timestamp('created_at').defaultTo(transaction.fn.now());
          table.timestamp('updated_at').defaultTo(transaction.fn.now());
        });

        await transaction.commit();
        migrationsLogger.info('Table users created');
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
        const isTableExists = await transaction.schema.hasTable('users');
        if (!isTableExists) {
          migrationsLogger.warn('Table users does not exist');
          return;
        }

        await transaction.schema.dropTable('users');
        await transaction.commit();
        migrationsLogger.info('Table users deleted');
      } catch (error) {
        migrationsLogger.error(error);
        throw error;
      }
    });
  }
}

export const { up, down } = Migration;
