import express from 'express';
import { getReviews, createReview } from '../controllers/reviewsController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', authenticate, authorize('user'), createReview);

export default router;
