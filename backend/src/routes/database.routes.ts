import { Router } from 'express';
import databaseController from '../controllers/database.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/databases/:id', (req, res, next) => databaseController.getById(req, res, next));
router.post('/databases/:id/properties', (req, res, next) => databaseController.addProperty(req, res, next));
router.patch('/databases/:id/properties/:propertyId', (req, res, next) => databaseController.updateProperty(req, res, next));
router.delete('/databases/:id/properties/:propertyId', (req, res, next) => databaseController.deleteProperty(req, res, next));
router.get('/databases/:id/rows', (req, res, next) => databaseController.getRows(req, res, next));
router.post('/databases/:id/rows', (req, res, next) => databaseController.createRow(req, res, next));
router.patch('/databases/:id/rows/:rowId', (req, res, next) => databaseController.updateRow(req, res, next));
router.delete('/databases/:id/rows/:rowId', (req, res, next) => databaseController.deleteRow(req, res, next));

export default router;
