import { Db, MongoClient } from 'mongodb';
import { MigrationInterface } from 'mongo-migrate-ts';
import {
  MigrationLogger,
  migrationsLogger
} from '@decorators';

const LoginCollectionName = 'login';

export class Migration20241213010149 implements MigrationInterface {
  @MigrationLogger
  public async up(db: Db, client: MongoClient): Promise<void | never> {
    const clientSession = client.startSession();
    try {
      await clientSession.withTransaction(async () => {
        const collections = await db.listCollections({ name: LoginCollectionName }).toArray();
        const isCollectionExists = collections.length > 0;

        if (isCollectionExists) {
          migrationsLogger.warn(`Collection ${LoginCollectionName} already exists`);
          return;
        }

        await db.createCollection(LoginCollectionName);
        await db.collection(LoginCollectionName).createIndex({ email: 1 }, { unique: true });

        migrationsLogger.info(`Collection ${LoginCollectionName} created`);
      });
    } catch (e) {
      migrationsLogger.error(
        `Error in migration ${this.constructor.name}: ${e}`,
      );
      throw e;
    } finally {
      await clientSession.endSession();
    }
  }

  @MigrationLogger
  public async down(db: Db, client: MongoClient): Promise<void | never> {
    const clientSession = client.startSession();
    try {
      await clientSession.withTransaction(async () => {
        const collections = await db.listCollections({ name: LoginCollectionName }).toArray();
        const isCollectionExists = collections.length > 0;

        if (!isCollectionExists) {
          migrationsLogger.warn(`Collection ${LoginCollectionName} does not exist`);
          return;
        }

        await db.collection(LoginCollectionName).drop();
        migrationsLogger.info(`Collection ${LoginCollectionName} deleted`);
      });
    } catch (e) {
      migrationsLogger.error(
        `Error in migration ${this.constructor.name}: ${e}`,
      );
      throw e;
    } finally {
      await clientSession.endSession();
    }
  }
}