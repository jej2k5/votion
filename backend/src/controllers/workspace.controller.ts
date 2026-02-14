import { Response, NextFunction } from 'express';
import { z } from 'zod';
import workspaceService from '../services/workspace.service';
import { AuthRequest } from '../types';

const createSchema = z.object({
  name: z.string().min(1).max(255),
  icon: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  icon: z.string().optional(),
});

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']).optional().default('member'),
});

export class WorkspaceController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspaces = await workspaceService.list(req.user!.id);
      res.json(workspaces);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body);
      const workspace = await workspaceService.create(req.user!.id, data.name, data.icon);
      res.status(201).json(workspace);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.getById(req.params.id, req.user!.id);
      res.json(workspace);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateSchema.parse(req.body);
      const workspace = await workspaceService.update(req.params.id, req.user!.id, data);
      res.json(workspace);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await workspaceService.delete(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = addMemberSchema.parse(req.body);
      const member = await workspaceService.addMember(
        req.params.id,
        req.user!.id,
        data.email,
        data.role
      );
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await workspaceService.removeMember(req.params.id, req.user!.id, req.params.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new WorkspaceController();
