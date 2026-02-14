import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { WorkspaceRole } from '../types';

export class WorkspaceService {
  async list(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: { select: { members: true, pages: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    }));
  }

  async create(userId: string, name: string, icon?: string) {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        icon,
        ownerId: userId,
        members: {
          create: { userId, role: 'owner' },
        },
      },
      include: {
        _count: { select: { members: true, pages: true } },
      },
    });
    return workspace;
  }

  async getById(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) {
      throw new AppError('Workspace not found or access denied', 404);
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: { select: { id: true, email: true, name: true, avatarUrl: true } },
          },
        },
        _count: { select: { pages: true } },
      },
    });
    return workspace;
  }

  async update(workspaceId: string, userId: string, data: { name?: string; icon?: string }) {
    await this.requireRole(workspaceId, userId, ['owner', 'admin']);

    return prisma.workspace.update({
      where: { id: workspaceId },
      data,
    });
  }

  async delete(workspaceId: string, userId: string) {
    await this.requireRole(workspaceId, userId, ['owner']);
    await prisma.workspace.delete({ where: { id: workspaceId } });
  }

  async addMember(workspaceId: string, requesterId: string, email: string, role: WorkspaceRole = 'member') {
    await this.requireRole(workspaceId, requesterId, ['owner', 'admin']);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });
    if (existing) {
      throw new AppError('User is already a member', 409);
    }

    return prisma.workspaceMember.create({
      data: { workspaceId, userId: user.id, role },
      include: {
        user: { select: { id: true, email: true, name: true, avatarUrl: true } },
      },
    });
  }

  async removeMember(workspaceId: string, requesterId: string, targetUserId: string) {
    await this.requireRole(workspaceId, requesterId, ['owner', 'admin']);

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (workspace?.ownerId === targetUserId) {
      throw new AppError('Cannot remove workspace owner', 400);
    }

    await prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    });
  }

  async requireRole(workspaceId: string, userId: string, roles: string[]): Promise<void> {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member || !roles.includes(member.role)) {
      throw new AppError('Insufficient permissions', 403);
    }
  }

  async isMember(workspaceId: string, userId: string): Promise<boolean> {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    return !!member;
  }
}

export default new WorkspaceService();
