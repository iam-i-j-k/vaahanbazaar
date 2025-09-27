import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({ include: { user: true, model: true } });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { modelId, rating, comment } = req.body;
    const review = await prisma.review.create({
      data: { modelId, rating, comment, userId: req.user.id },
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
