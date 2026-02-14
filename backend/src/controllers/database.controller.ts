import { Response, NextFunction } from 'express';
import { z } from 'zod';
import databaseService from '../services/database.service';
import { AuthRequest } from '../types';

const addPropertySchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['text', 'number', 'select', 'multi_select', 'date', 'checkbox', 'url', 'email', 'person']),
  options: z.record(z.unknown()).optional(),
});

const updatePropertySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['text', 'number', 'select', 'multi_select', 'date', 'checkbox', 'url', 'email', 'person']).optional(),
  options: z.record(z.unknown()).optional(),
});

const createRowSchema = z.object({
  values: z.record(z.unknown()).optional(),
});

const updateRowSchema = z.object({
  values: z.record(z.unknown()),
});

export class DatabaseController {
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const database = await databaseService.getById(req.params.id, req.user!.id);
      res.json(database);
    } catch (error) {
      next(error);
    }
  }

  async addProperty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = addPropertySchema.parse(req.body);
      const property = await databaseService.addProperty(req.params.id, req.user!.id, data);
      res.status(201).json(property);
    } catch (error) {
      next(error);
    }
  }

  async updateProperty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updatePropertySchema.parse(req.body);
      const property = await databaseService.updateProperty(req.params.propertyId, req.user!.id, data);
      res.json(property);
    } catch (error) {
      next(error);
    }
  }

  async deleteProperty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await databaseService.deleteProperty(req.params.propertyId, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getRows(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rows = await databaseService.getRows(req.params.id, req.user!.id);
      res.json(rows);
    } catch (error) {
      next(error);
    }
  }

  async createRow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createRowSchema.parse(req.body);
      const row = await databaseService.createRow(req.params.id, req.user!.id, data.values);
      res.status(201).json(row);
    } catch (error) {
      next(error);
    }
  }

  async updateRow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateRowSchema.parse(req.body);
      const row = await databaseService.updateRow(req.params.rowId, req.user!.id, data.values);
      res.json(row);
    } catch (error) {
      next(error);
    }
  }

  async deleteRow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await databaseService.deleteRow(req.params.rowId, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new DatabaseController();
