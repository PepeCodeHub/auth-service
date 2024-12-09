import { Knex } from 'knex';
import { MigrationLogger, migrationsLogger } from '../decorators';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

export class Seed {
  @MigrationLogger
  static async seed(knex: Knex): Promise<void> {
    await knex.transaction(async transaction => {
      try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          throw new Error(
            'Admin email or password is not set in environment variables.',
          );
        }

        // Find the admin role
        const adminRole = await transaction('roles')
          .where({ name: 'admin' })
          .first();

        if (!adminRole) {
          throw new Error('Admin role not found');
        }

        // Check if the user already exists
        const existingUser = await transaction('users')
          .where({ email: adminEmail })
          .first();

        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(adminPassword, 10); // Hash the password

          await transaction('users').insert({
            email: adminEmail,
            password: hashedPassword,
            role_id: adminRole.id,
            created_at: transaction.fn.now(),
            updated_at: transaction.fn.now(),
          });

          migrationsLogger.info('First admin user created');
        } else {
          migrationsLogger.warn('First user already exists');
        }

        await transaction.commit();
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
        // Add your clear logic here
        await transaction('users').delete();
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
