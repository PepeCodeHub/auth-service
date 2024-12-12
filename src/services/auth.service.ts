import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserDTO } from '../types/user.types';
import { AuthResponse } from '../types/http.types';
import { pg_connector } from '../database/pg_connector';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';
const SALT_ROUNDS = 10;

export class AuthService {
  async register(userDto: UserDTO): Promise<AuthResponse> {
    try {
      const existingUser = await pg_connector('users').where({ email: userDto.email }).first();

      if (existingUser) {
        return {
          statusCode: 400,
          data: {
            message: 'User already exists',
          },
        };
      }

      const hashedPassword = await bcrypt.hash(userDto.password, SALT_ROUNDS);

      const user: User = {
        email: userDto.email,
        password: hashedPassword,
      };

      await pg_connector<User>('users').insert(user);

      const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: '24h',
      });

      const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: '7d',
      });

      await pg_connector('refresh_tokens').insert({
        user_id: user.id,
        token: refreshToken,
      });

      return {
        data: { accessToken, refreshToken },
        statusCode: 200,
      };
    } catch (error) {
      logger.error('Error registering user:', error);

      return {
        statusCode: 500,
        data: {
          message: 'Internal server error',
        },
      };
    }
  }

  async login(userDto: UserDTO): Promise<AuthResponse> {
    const existingUser = await pg_connector<User>('users')
      .where({ email: userDto.email })
      .first();

    if (!existingUser) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(userDto.password, existingUser.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = jwt.sign({ userId: existingUser.id }, JWT_SECRET, {
      expiresIn: '24h',
    });

    const refreshToken = jwt.sign({ userId: existingUser.id }, JWT_SECRET, {
      expiresIn: '7d',
    });
    
    return {
      data: { accessToken, refreshToken },
      statusCode: 200,
    };
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const existingToken = await pg_connector('refresh_tokens').where({ token: refreshToken }).first();

    if (!existingToken) {
      return {
        statusCode: 401,
        data: {
          message: 'Invalid token',
        },
      };
    }

    const accessToken = jwt.sign({ userId: existingToken.user_id }, JWT_SECRET, {
      expiresIn: '24h',
    });

    return {
      data: { accessToken },
      statusCode: 200,
    };
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
