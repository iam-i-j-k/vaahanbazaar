import express from 'express';
import { getBookings, createBooking } from '../controllers/bookingsController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

router.get('/', authenticate, authorize('user', 'dealer', 'admin'), getBookings);
router.post('/', authenticate, authorize('user'), createBooking);

export default router;
