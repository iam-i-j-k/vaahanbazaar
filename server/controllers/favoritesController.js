import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({ where: { userId: req.user.id } });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { modelId } = req.body;
    const favorite = await prisma.favorite.create({ data: { modelId, userId: req.user.id } });
    res.json(favorite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.favorite.delete({ where: { id } });
    res.json({ message: 'Removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
