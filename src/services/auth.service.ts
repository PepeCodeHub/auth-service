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
      const existingUser = await pg_connector<User>('users')
        .where({ email: userDto.email })
        .first();
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

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: '24h',
      });

      return {
        data: { token },
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
    console.log('🚀 ~ AuthService ~ login ~ userDto:', userDto);
    // const user = users.find(u => u.email === userDto.email);
    // if (!user) {
    //   throw new Error('Invalid credentials');
    // }

    // const isValid = await bcrypt.compare(userDto.password, user.password);
    // if (!isValid) {
    //   throw new Error('Invalid credentials');
    // }

    // const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    return {
      // data: { token },
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
