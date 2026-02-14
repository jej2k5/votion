import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import workspaceService from './workspace.service';

export class BlockService {
  async list(pageId: string, userId: string) {
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page || page.isDeleted) {
      throw new AppError('Page not found', 404);
    }

    const isMember = await workspaceService.isMember(page.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    return prisma.block.findMany({
      where: { pageId },
      orderBy: { position: 'asc' },
      include: {
        children: { orderBy: { position: 'asc' } },
      },
    });
  }

  async create(
    pageId: string,
    userId: string,
    data: {
      type: string;
      content?: object;
      properties?: object;
      parentBlockId?: string;
      position?: number;
    }
  ) {
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page || page.isDeleted) {
      throw new AppError('Page not found', 404);
    }

    const isMember = await workspaceService.isMember(page.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    let position = data.position;
    if (position === undefined) {
      const maxPos = await prisma.block.aggregate({
        where: { pageId, parentBlockId: data.parentBlockId || null },
        _max: { position: true },
      });
      position = (maxPos._max.position ?? -1) + 1;
    }

    return prisma.block.create({
      data: {
        pageId,
        type: data.type,
        content: data.content || {},
        properties: data.properties || {},
        parentBlockId: data.parentBlockId || null,
        position,
      },
    });
  }

  async update(
    blockId: string,
    userId: string,
    data: { type?: string; content?: object; properties?: object }
  ) {
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      include: { page: true },
    });
    if (!block) {
      throw new AppError('Block not found', 404);
    }

    const isMember = await workspaceService.isMember(block.page.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    return prisma.block.update({
      where: { id: blockId },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.properties !== undefined && { properties: data.properties }),
      },
    });
  }

  async delete(blockId: string, userId: string) {
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      include: { page: true },
    });
    if (!block) {
      throw new AppError('Block not found', 404);
    }

    const isMember = await workspaceService.isMember(block.page.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    await prisma.block.delete({ where: { id: blockId } });
  }

  async move(
    blockId: string,
    userId: string,
    data: { parentBlockId?: string | null; position: number }
  ) {
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      include: { page: true },
    });
    if (!block) {
      throw new AppError('Block not found', 404);
    }

    const isMember = await workspaceService.isMember(block.page.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    return prisma.block.update({
      where: { id: blockId },
      data: {
        parentBlockId: data.parentBlockId === undefined ? block.parentBlockId : data.parentBlockId,
        position: data.position,
      },
    });
  }
}

export default new BlockService();
