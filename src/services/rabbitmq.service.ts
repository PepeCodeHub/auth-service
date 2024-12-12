import amqp, { Channel, Connection } from 'amqplib';
import { logger } from '../utils/logger';
import { HttpMethod, AuthRequest, AuthResponse } from '../types/http.types';
import { rabbitmqConfig } from '../config/rabbitmq.config';
import { authService } from './auth.service';

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

    switch (action) {
    case HttpMethod.POST:
      switch (path) {
      case '/login':
        return authService.login(body);
      case '/api/auth/register':
        return authService.register(body);
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
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
      throw error;
    }
  }
}

export const rabbitMQService = new RabbitMQService();
