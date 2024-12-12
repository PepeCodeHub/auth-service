export const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  queue: 'auth.service',
  exchanges: {
    api: 'api.gateway',
  },
  retryAttempts: 5,
  retryDelay: 5000,
};
