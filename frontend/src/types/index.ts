export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string | null;
  ownerId: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    pages: number;
  };
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export interface Page {
  id: string;
  workspaceId: string;
  parentId: string | null;
  title: string | null;
  icon: string | null;
  coverUrl: string | null;
  position: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  children?: Page[];
  blocks?: Block[];
}

export interface Block {
  id: string;
  pageId: string;
  parentBlockId: string | null;
  type: string;
  content: Record<string, unknown>;
  properties: Record<string, unknown>;
  position: number;
  createdAt: string;
  updatedAt: string;
  children?: Block[];
}

export interface Database {
  id: string;
  pageId: string;
  workspaceId: string;
  name: string;
  description: string | null;
  properties: DatabaseProperty[];
  rows: DatabaseRow[];
}

export interface DatabaseProperty {
  id: string;
  databaseId: string;
  name: string;
  type: string;
  options: Record<string, unknown> | null;
  position: number;
}

export interface DatabaseRow {
  id: string;
  databaseId: string;
  pageId: string | null;
  position: number;
  cells: DatabaseCell[];
}

export interface DatabaseCell {
  id: string;
  rowId: string;
  propertyId: string;
  value: unknown;
  property: DatabaseProperty;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
