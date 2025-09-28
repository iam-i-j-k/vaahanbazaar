import express from 'express';
const router = express.Router();
import { authenticate } from '../middlewares/auth.js';
import { signup, login, getDealerProfile, getDealerListings, getDealerBookings } from '../controllers/dealersController.js';

router.post('/signup', signup);
router.post('/login', login);

// protected profile route example
router.get('/me', authenticate, getDealerProfile);
router.get('/dealerListings', authenticate , getDealerListings )
router.get('/bookings',authenticate, getDealerBookings)

export default router;