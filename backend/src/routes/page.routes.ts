import { Router } from 'express';
import pageController from '../controllers/page.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Workspace-scoped routes
router.get('/workspaces/:workspaceId/pages', (req, res, next) => pageController.list(req, res, next));
router.post('/workspaces/:workspaceId/pages', (req, res, next) => pageController.create(req, res, next));

// Page-scoped routes
router.get('/pages/:id', (req, res, next) => pageController.getById(req, res, next));
router.patch('/pages/:id', (req, res, next) => pageController.update(req, res, next));
router.delete('/pages/:id', (req, res, next) => pageController.delete(req, res, next));
router.post('/pages/:id/restore', (req, res, next) => pageController.restore(req, res, next));

export default router;
