import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

export async function seed(knex: Knex): Promise<void> {
  // Use environment variables to get the admin user info
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'Admin email or password is not set in environment variables.',
    );
  }

  // Check if the user already exists
  const existingUser = await knex('users').where({ email: adminEmail }).first();

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10); // Hash the password

    await knex('users').insert({
      email: adminEmail,
      password: hashedPassword,
      is_admin: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });

    console.log('First admin user created');
  } else {
    console.log('First user already exists');
  }
}
