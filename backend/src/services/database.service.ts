import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import workspaceService from './workspace.service';

export class DatabaseService {
  async getById(databaseId: string, userId: string) {
    const database = await prisma.database.findUnique({
      where: { id: databaseId },
      include: {
        properties: { orderBy: { position: 'asc' } },
        rows: {
          orderBy: { position: 'asc' },
          include: {
            cells: { include: { property: true } },
          },
        },
      },
    });

    if (!database) {
      throw new AppError('Database not found', 404);
    }

    const isMember = await workspaceService.isMember(database.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    return database;
  }

  async create(
    workspaceId: string,
    userId: string,
    data: { name: string; description?: string; pageId: string }
  ) {
    const isMember = await workspaceService.isMember(workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    return prisma.database.create({
      data: {
        pageId: data.pageId,
        workspaceId,
        name: data.name,
        description: data.description,
        properties: {
          create: {
            name: 'Title',
            type: 'text',
            position: 0,
          },
        },
      },
      include: {
        properties: true,
      },
    });
  }

  async addProperty(
    databaseId: string,
    userId: string,
    data: { name: string; type: string; options?: object }
  ) {
    const database = await prisma.database.findUnique({ where: { id: databaseId } });
    if (!database) {
      throw new AppError('Database not found', 404);
    }

    const isMember = await workspaceService.isMember(database.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    const maxPos = await prisma.databaseProperty.aggregate({
      where: { databaseId },
      _max: { position: true },
    });

    return prisma.databaseProperty.create({
      data: {
        databaseId,
        name: data.name,
        type: data.type,
        options: data.options || undefined,
        position: (maxPos._max.position ?? -1) + 1,
      },
    });
  }

  async updateProperty(
    propertyId: string,
    userId: string,
    data: { name?: string; type?: string; options?: object }
  ) {
    const property = await prisma.databaseProperty.findUnique({
      where: { id: propertyId },
      include: { database: true },
    });
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    const isMember = await workspaceService.isMember(property.database.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    return prisma.databaseProperty.update({
      where: { id: propertyId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.options !== undefined && { options: data.options }),
      },
    });
  }

  async deleteProperty(propertyId: string, userId: string) {
    const property = await prisma.databaseProperty.findUnique({
      where: { id: propertyId },
      include: { database: true },
    });
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    const isMember = await workspaceService.isMember(property.database.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    await prisma.databaseProperty.delete({ where: { id: propertyId } });
  }

  async getRows(databaseId: string, userId: string) {
    const database = await prisma.database.findUnique({ where: { id: databaseId } });
    if (!database) {
      throw new AppError('Database not found', 404);
    }

    const isMember = await workspaceService.isMember(database.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    return prisma.databaseRow.findMany({
      where: { databaseId },
      orderBy: { position: 'asc' },
      include: {
        cells: { include: { property: true } },
      },
    });
  }

  async createRow(databaseId: string, userId: string, values?: Record<string, unknown>) {
    const database = await prisma.database.findUnique({
      where: { id: databaseId },
      include: { properties: true },
    });
    if (!database) {
      throw new AppError('Database not found', 404);
    }

    const isMember = await workspaceService.isMember(database.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    const maxPos = await prisma.databaseRow.aggregate({
      where: { databaseId },
      _max: { position: true },
    });

    const row = await prisma.databaseRow.create({
      data: {
        databaseId,
        position: (maxPos._max.position ?? -1) + 1,
        cells: values
          ? {
              create: Object.entries(values)
                .filter(([propertyId]) =>
                  database.properties.some((p) => p.id === propertyId)
                )
                .map(([propertyId, value]) => ({
                  propertyId,
                  value: value as object,
                })),
            }
          : undefined,
      },
      include: {
        cells: { include: { property: true } },
      },
    });

    return row;
  }

  async updateRow(
    rowId: string,
    userId: string,
    values: Record<string, unknown>
  ) {
    const row = await prisma.databaseRow.findUnique({
      where: { id: rowId },
      include: { database: true },
    });
    if (!row) {
      throw new AppError('Row not found', 404);
    }

    const isMember = await workspaceService.isMember(row.database.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    for (const [propertyId, value] of Object.entries(values)) {
      await prisma.databaseCell.upsert({
        where: { rowId_propertyId: { rowId, propertyId } },
        create: { rowId, propertyId, value: value as object },
        update: { value: value as object },
      });
    }

    return prisma.databaseRow.findUnique({
      where: { id: rowId },
      include: { cells: { include: { property: true } } },
    });
  }

  async deleteRow(rowId: string, userId: string) {
    const row = await prisma.databaseRow.findUnique({
      where: { id: rowId },
      include: { database: true },
    });
    if (!row) {
      throw new AppError('Row not found', 404);
    }

    const isMember = await workspaceService.isMember(row.database.workspaceId, userId);
    if (!isMember) {
      throw new AppError('Access denied', 403);
    }

    await prisma.databaseRow.delete({ where: { id: rowId } });
  }
}

export default new DatabaseService();
