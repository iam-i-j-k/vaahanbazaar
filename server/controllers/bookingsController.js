import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { listing: true, user: true, dealer: true },
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { listingId, appointmentTs } = req.body;
    const booking = await prisma.booking.create({
      data: {
        listingId,
        appointmentTs: new Date(appointmentTs),
        userId: req.user.id,
        dealerId: (await prisma.listing.findUnique({ where: { id: listingId } })).dealerId,
      },
    });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
