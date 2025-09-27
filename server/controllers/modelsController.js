import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllModels = async (req, res) => {
  try {
    const models = await prisma.vehicleModel.findMany();
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getModelById = async (req, res) => {
  try {
    const { id } = req.params;
    const model = await prisma.vehicleModel.findUnique({ where: { id } });
    if (!model) return res.status(404).json({ error: 'Model not found' });
    res.json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createModel = async (req, res) => {
  try {
    const data = req.body;
    const model = await prisma.vehicleModel.create({ data });
    res.json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
