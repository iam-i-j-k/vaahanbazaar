import express from 'express';
import { getPriceAlerts, createPriceAlert, deletePriceAlert } from '../controllers/priceAlertsController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

router.get('/', authenticate, authorize('user'), getPriceAlerts);
router.post('/', authenticate, authorize('user'), createPriceAlert);
router.delete('/:id', authenticate, authorize('user'), deletePriceAlert);

export default router;
