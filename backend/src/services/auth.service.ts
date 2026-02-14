import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { JwtTokens } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<{ user: { id: string; email: string; name: string | null }; tokens: JwtTokens }> {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name || null },
      select: { id: true, email: true, name: true },
    });

    const tokens = generateTokens({ userId: user.id, email: user.email });
    return { user, tokens };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: { id: string; email: string; name: string | null }; tokens: JwtTokens }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid credentials', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = generateTokens({ userId: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, name: user.name },
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<JwtTokens> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
      if (!user || !user.isActive) {
        throw new AppError('Invalid refresh token', 401);
      }
      return generateTokens({ userId: user.id, email: user.email });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}

export default new AuthService();
