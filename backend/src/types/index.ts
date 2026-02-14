import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export type BlockType =
  | 'paragraph'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'bulleted_list'
  | 'numbered_list'
  | 'todo'
  | 'quote'
  | 'code'
  | 'image'
  | 'embed'
  | 'divider';

export type DatabasePropertyType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'person';
