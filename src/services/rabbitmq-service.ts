import amqp, { Channel, Connection } from 'amqplib';
import { logger } from '@utils';
import type { AuthRequest, AuthResponse } from '@types';
import { HttpMethod } from '@constants';
import { rabbitmqConfig } from '@config';
import { authService } from './auth-service';

export class RabbitMQService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private queueName: string = rabbitmqConfig.queue;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(rabbitmqConfig.url);
      this.channel = await this.connection.createChannel();
      this.channel.prefetch(10);

      await this.channel.assertQueue(this.queueName);

      logger.info('RabbitMQ service initialized');
    } catch (error) {
      logger.error('Error initializing RabbitMQ service:', error);
      throw error;
    }
  }

  private async handleAuthRequest(request: AuthRequest): Promise<AuthResponse> {
    const { action, path, body } = request;
    // const token = headers?.authorization?.split(' ')[1];

    if (path) {
      const basePath = '/api/auth';

      switch (action) {
      case HttpMethod.POST:
        switch (path.replace(basePath, '')) {
        case '/login':
          return authService.login(body);
        case '/register':
          return authService.register(body);
        case '/logout':
          return authService.logout(body);
        default:
          return {
            statusCode: 404,
            data: {
              message: `Path ${path} not found`,
            },
          };

        }
    
      default:
        return {
          statusCode: 405,
          data: {
            message: `Method ${action} not allowed`,
          },
        };
      }
    }

    return {
      statusCode: 400,
      data: {
        message: 'Invalid request',
      },
    };
  }

  async consume(): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    await this.channel.consume(this.queueName, async msg => {
      if (!msg) return;

      try {
        const request = JSON.parse(msg.content.toString()) as AuthRequest;
        logger.info(`Processing ${request.action} request to ${request.path}`);

        const response = await this.handleAuthRequest(request);

        this.channel?.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(response)),
          { correlationId: msg.properties.correlationId },
        );

        this.channel?.ack(msg);
      } catch (error) {
        logger.error('Error processing message:', error);
        this.channel?.nack(msg);
      }
    });
  }

  async close(): Promise<void> {
    if (this.channel) {
      try {
        await this.channel.close();
        logger.info('RabbitMQ channel closed');
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes('Channel closing')) {
          logger.error('Error closing RabbitMQ channel:', error);
        }
      } finally {
        this.channel = null;
      }
    }

    if (this.connection) {
      try {
        await this.connection.close();
        logger.info('RabbitMQ connection closed');
      } catch (error) {
        logger.error('Error closing RabbitMQ connection:', error);
      } finally {
        this.connection = null;
      }
    }
  }
}

export const rabbitMQService = new RabbitMQService();
