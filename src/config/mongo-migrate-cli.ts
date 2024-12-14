import { mongoMigrateCli } from 'mongo-migrate-ts';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/db';
const db = url.split('/').pop() || 'db';

mongoMigrateCli({
  uri: url,
  database: db,
  migrationsDir: './src/database/MongoDB/migrations',
  migrationsCollection: 'migrations_logs',
  migrationNameTimestampFormat: 'yyyyMMddHHmmss',
  options: {
    maxPoolSize: 10,
    minPoolSize: 2,
    connectTimeoutMS: 10000, 
  }
});