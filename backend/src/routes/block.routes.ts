import { Router } from 'express';
import blockController from '../controllers/block.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Page-scoped routes
router.get('/pages/:pageId/blocks', (req, res, next) => blockController.list(req, res, next));
router.post('/pages/:pageId/blocks', (req, res, next) => blockController.create(req, res, next));

// Block-scoped routes
router.patch('/blocks/:id', (req, res, next) => blockController.update(req, res, next));
router.delete('/blocks/:id', (req, res, next) => blockController.delete(req, res, next));
router.post('/blocks/:id/move', (req, res, next) => blockController.move(req, res, next));

export default router;
