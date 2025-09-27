import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getPriceAlerts = async (req, res) => {
  try {
    const alerts = await prisma.priceAlert.findMany({ where: { userId: req.user.id } });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPriceAlert = async (req, res) => {
  try {
    const { modelId, targetPrice } = req.body;
    const alert = await prisma.priceAlert.create({ data: { modelId, targetPrice, userId: req.user.id } });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePriceAlert = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.priceAlert.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
