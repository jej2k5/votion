import { Response, NextFunction } from 'express';
import { z } from 'zod';
import pageService from '../services/page.service';
import { AuthRequest } from '../types';

const createSchema = z.object({
  title: z.string().max(500).optional(),
  icon: z.string().optional(),
  parentId: z.string().uuid().optional(),
});

const updateSchema = z.object({
  title: z.string().max(500).optional(),
  icon: z.string().optional(),
  coverUrl: z.string().url().optional(),
  parentId: z.string().uuid().optional(),
  position: z.number().int().min(0).optional(),
});

export class PageController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pages = await pageService.list(req.params.workspaceId, req.user!.id);
      res.json(pages);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body);
      const page = await pageService.create(req.params.workspaceId, req.user!.id, data);
      res.status(201).json(page);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = await pageService.getById(req.params.id, req.user!.id);
      res.json(page);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateSchema.parse(req.body);
      const page = await pageService.update(req.params.id, req.user!.id, data);
      res.json(page);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await pageService.softDelete(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async restore(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = await pageService.restore(req.params.id, req.user!.id);
      res.json(page);
    } catch (error) {
      next(error);
    }
  }
}

export default new PageController();
