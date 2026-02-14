import { Router } from 'express';
import workspaceController from '../controllers/workspace.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => workspaceController.list(req, res, next));
router.post('/', (req, res, next) => workspaceController.create(req, res, next));
router.get('/:id', (req, res, next) => workspaceController.getById(req, res, next));
router.patch('/:id', (req, res, next) => workspaceController.update(req, res, next));
router.delete('/:id', (req, res, next) => workspaceController.delete(req, res, next));
router.post('/:id/members', (req, res, next) => workspaceController.addMember(req, res, next));
router.delete('/:id/members/:userId', (req, res, next) => workspaceController.removeMember(req, res, next));

export default router;
