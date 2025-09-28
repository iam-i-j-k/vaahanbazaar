import express from 'express';
import { getListings, createListing, getListingById } from '../controllers/listingsController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

router.get('/', getListings);
router.get('/:id', getListingById); // listing by id
router.post('/', authenticate, authorize('dealer', 'admin'), createListing);

export default router;
