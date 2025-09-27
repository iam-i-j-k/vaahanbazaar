import express from 'express';
import { getListings, createListing } from '../controllers/listingsController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

router.get('/', getListings);
router.post('/', authenticate, authorize('dealer', 'admin'), createListing);

export default router;
