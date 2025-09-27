import express from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoritesController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

router.get('/', authenticate, authorize('user'), getFavorites);
router.post('/', authenticate, authorize('user'), addFavorite);
router.delete('/:id', authenticate, authorize('user'), removeFavorite);

export default router;
