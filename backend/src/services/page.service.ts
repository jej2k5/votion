import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import workspaceService from './workspace.service';

export class PageService {
  async list(workspaceId: string, userId: string) {
    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    const pages = await prisma.page.findMany({
      where: { workspaceId, isDeleted: false },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        title: true,
        icon: true,
        parentId: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return pages;
  }

  async create(
    workspaceId: string,
    userId: string,
    data: { title?: string; icon?: string; parentId?: string }
  ) {
    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    if (data.parentId) {
      const parent = await prisma.page.findFirst({
        where: { id: data.parentId, workspaceId, isDeleted: false },
      });
      if (!parent) {
        throw new AppError('Parent page not found', 404);
      }
    }

    const maxPosition = await prisma.page.aggregate({
      where: { workspaceId, parentId: data.parentId || null, isDeleted: false },
      _max: { position: true },
    });

    const page = await prisma.page.create({
      data: {
        workspaceId,
        title: data.title || 'Untitled',
        icon: data.icon,
        parentId: data.parentId || null,
        position: (maxPosition._max.position ?? -1) + 1,
        createdBy: userId,
      },
    });

    return page;
  }

  async getById(pageId: string, userId: string) {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        children: {
          where: { isDeleted: false },
          orderBy: { position: 'asc' },
          select: { id: true, title: true, icon: true, position: true },
        },
        blocks: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!page || page.isDeleted) {
      throw new AppError('Page not found', 404);
    }

    const isMember = await workspaceService.isMember(page.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    return page;
  }

  async update(
    pageId: string,
    userId: string,
    data: { title?: string; icon?: string; coverUrl?: string; parentId?: string; position?: number }
  ) {
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page || page.isDeleted) {
      throw new AppError('Page not found', 404);
    }

    const isMember = await workspaceService.isMember(page.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    return prisma.page.update({
      where: { id: pageId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.position !== undefined && { position: data.position }),
      },
    });
  }

  async softDelete(pageId: string, userId: string) {
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      throw new AppError('Page not found', 404);
    }

    const isMember = await workspaceService.isMember(page.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    return prisma.page.update({
      where: { id: pageId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async restore(pageId: string, userId: string) {
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      throw new AppError('Page not found', 404);
    }

    const isMember = await workspaceService.isMember(page.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    return prisma.page.update({
      where: { id: pageId },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async getTrash(workspaceId: string, userId: string) {
    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    return prisma.page.findMany({
      where: { workspaceId, isDeleted: true },
      orderBy: { deletedAt: 'desc' },
      select: {
        id: true,
        title: true,
        icon: true,
        deletedAt: true,
      },
    });
  }
}

export default new PageService();
