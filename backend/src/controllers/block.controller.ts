import { Response, NextFunction } from 'express';
import { z } from 'zod';
import blockService from '../services/block.service';
import { AuthRequest } from '../types';

const createSchema = z.object({
  type: z.string(),
  content: z.record(z.unknown()).optional(),
  properties: z.record(z.unknown()).optional(),
  parentBlockId: z.string().uuid().optional(),
  position: z.number().int().min(0).optional(),
});

const updateSchema = z.object({
  type: z.string().optional(),
  content: z.record(z.unknown()).optional(),
  properties: z.record(z.unknown()).optional(),
});

const moveSchema = z.object({
  parentBlockId: z.string().uuid().nullable().optional(),
  position: z.number().int().min(0),
});

export class BlockController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const blocks = await blockService.list(req.params.pageId, req.user!.id);
      res.json(blocks);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body);
      const block = await blockService.create(req.params.pageId, req.user!.id, data);
      res.status(201).json(block);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateSchema.parse(req.body);
      const block = await blockService.update(req.params.id, req.user!.id, data);
      res.json(block);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await blockService.delete(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async move(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = moveSchema.parse(req.body);
      const block = await blockService.move(req.params.id, req.user!.id, data);
      res.json(block);
    } catch (error) {
      next(error);
    }
  }
}

export default new BlockController();
