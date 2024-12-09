import { Knex } from 'knex';
import * as dotenv from 'dotenv';
dotenv.config();

const config: Knex.Config = {
  client: 'postgresql',
  connection: {
    database: process.env.DB_NAME || 'my_db',
    user: process.env.DB_USER || 'username',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../database/migrations',
    extension: 'ts',
    stub: '../database/migration.stub',
  },
  seeds: {
    directory: '../database/seeds',
    extension: 'ts',
    stub: '../database/seed.stub',
  },
  // debug: true,
};

export default config;
