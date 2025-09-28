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
    const { brand, modelName, category, fuelType, price, mileage, engineCC, batteryKwh, launchDate, description } = req.body;

    if (!brand || !modelName) {
      return res.status(400).json({ error: "brand and modelName are required" });
    }

    const model = await prisma.vehicleModel.create({
      data: {
        brand,
        modelName,
        category,
        fuelType,
        price: price ? parseFloat(price) : undefined,
        mileage: mileage ? parseFloat(mileage) : undefined,
        engineCC: engineCC ? parseInt(engineCC) : undefined,
        batteryKwh: batteryKwh ? parseFloat(batteryKwh) : undefined,
        launchDate: launchDate ? new Date(launchDate) : undefined,
        description,
      },
    });

    res.status(201).json(model);
  } catch (err) {
    console.error("createModel error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update vehicle model
 * PUT /api/models/:id
 */
export const updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, modelName, category, fuelType, price, mileage, engineCC, batteryKwh, launchDate, description } = req.body;

    const existing = await prisma.vehicleModel.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Model not found' });

    const data = {
      ...(brand !== undefined && { brand }),
      ...(modelName !== undefined && { modelName }),
      ...(category !== undefined && { category }),
      ...(fuelType !== undefined && { fuelType }),
      ...(price !== undefined && { price: price !== null ? parseFloat(price) : null }),
      ...(mileage !== undefined && { mileage: mileage !== null ? parseFloat(mileage) : null }),
      ...(engineCC !== undefined && { engineCC: engineCC !== null ? parseInt(engineCC) : null }),
      ...(batteryKwh !== undefined && { batteryKwh: batteryKwh !== null ? parseFloat(batteryKwh) : null }),
      ...(launchDate !== undefined && { launchDate: launchDate ? new Date(launchDate) : null }),
      ...(description !== undefined && { description }),
    };

    const updated = await prisma.vehicleModel.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (err) {
    console.error("updateModel error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete vehicle model
 * DELETE /api/models/:id
 *
 * Prevent deletion if there are listings linked to the model.
 */
export const deleteModel = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.vehicleModel.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Model not found' });

    const linked = await prisma.listing.count({ where: { modelId: id } });
    if (linked > 0) {
      return res.status(400).json({ error: `Cannot delete model: ${linked} listing(s) reference this model` });
    }

    await prisma.vehicleModel.delete({ where: { id } });
    res.json({ message: 'Model deleted' });
  } catch (err) {
    console.error("deleteModel error:", err);
    res.status(500).json({ error: err.message });
  }
};

