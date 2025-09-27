import express from 'express';
import { signup, login, getProfile } from '../controllers/usersController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getProfile);

export default router;
