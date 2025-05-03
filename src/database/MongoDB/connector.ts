import { logger } from '@utils';
import mongoose from 'mongoose';

export const mongoConnector = mongoose.createConnection(process.env.MONGO_DB_URL as string, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  autoIndex: false,
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 30000,
});

mongoConnector.on('connected', () => {
  logger.info('MongoDB connected');
});

mongoConnector.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoConnector.on('disconnected', () => {
  logger.info('MongoDB disconnected');
});

mongoConnector.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

mongoConnector.on('timeout', () => {
  logger.error('MongoDB connection timeout');
});

mongoConnector.on('close', () => {
  logger.info('MongoDB connection closed');
});

mongoConnector.on('open', () => {
  logger.info('MongoDB connection opened');
});

mongoConnector.on('fullsetup', () => {
  logger.info('MongoDB full setup');
});

mongoConnector.on('all', () => {
  logger.info('MongoDB all');
});

mongoConnector.on('topologyDescriptionChanged', () => {
  logger.info('MongoDB topology description changed');
});