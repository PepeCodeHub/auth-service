import { rabbitMQService } from '@services';
import { rabbitmqConfig } from '@config/rabbitmq-config';
import { logger } from '@utils';

async function connectWithRetry(attempt = 5): Promise<void> {
  try {
    await rabbitMQService.connect();
    logger.info('Successfully connected to RabbitMQ');
  } catch (error) {
    logger.error(`Connection attempt ${attempt} failed:`, error);

    if (attempt < rabbitmqConfig.retryAttempts) {
      logger.info(`Retrying in ${rabbitmqConfig.retryDelay}ms...`);
      await new Promise(resolve =>
        setTimeout(resolve, rabbitmqConfig.retryDelay),
      );
      return connectWithRetry(attempt + 1);
    }

    throw error;
  }
}

const start = async () => {
  try {
    await connectWithRetry();
    await rabbitMQService.consume();
    logger.info('Auth service is running');
  } catch (err) {
    logger.error('Failed to start service:', err);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  try {
    await rabbitMQService.close();
    logger.info('Gracefully shutting down');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

start();
