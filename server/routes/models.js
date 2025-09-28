import express from 'express';
import { getAllModels, getModelById, createModel } from '../controllers/modelsController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

router.get('/', getAllModels);
router.get('/:id', getModelById);
router.post('/', authenticate, authorize('dealer'), createModel);

export default router;
