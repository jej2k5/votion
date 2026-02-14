import jwt from 'jsonwebtoken';
import { TokenPayload, JwtTokens } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

// Convert duration strings to seconds
function parseExpiry(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // default 15 minutes
  const num = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 3600;
    case 'd': return num * 86400;
    default: return 900;
  }
}

const JWT_EXPIRES_IN = parseExpiry(process.env.JWT_EXPIRES_IN || '15m');
const JWT_REFRESH_EXPIRES_IN = parseExpiry(process.env.JWT_REFRESH_EXPIRES_IN || '7d');

export function generateTokens(payload: TokenPayload): JwtTokens {
  const accessToken = jwt.sign({ ...payload }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ ...payload }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}
