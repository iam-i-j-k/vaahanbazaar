import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getListings = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      include: { model: true, dealer: true, images: true },
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createListing = async (req, res) => {
  try {
    const data = req.body;
    const listing = await prisma.listing.create({ data });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        model: true,
        dealer: true,
        images: true,
        bookings: {
          include: { user: true },
        },
      },
    });

    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
