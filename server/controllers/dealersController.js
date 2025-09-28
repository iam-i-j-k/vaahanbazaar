import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // create auth user record with role 'dealer'
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: 'dealer',
      },
    });

    // optional: create a dealer profile record (separate model)
    await prisma.dealer.create({
      data: {
        name,
        email,
        createdAt: new Date(),
      },
    }).catch(() => {
      // ignore dealer profile creation errors to not fail the signup if dealer model constraints differ
    });

    const token = generateToken({ id: user.id, role: 'dealer' });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.status(201).json({ user: userResponse, token });
  } catch (err) {
    console.error('dealer signup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'dealer') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, role: 'dealer' });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.json({ user: userResponse, token });
  } catch (err) {
    console.error('dealer login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getDealerProfile = async (req, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: 'Not found' });

    return res.json({ user });
  } catch (err) {
    console.error('dealer profile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/dealer/listings
 * Returns listings owned by the authenticated dealer.
 * Logic:
 *  - Read req.user.id (set by auth middleware from JWT)
 *  - Find the corresponding Dealer profile by matching dealer.email === user.email
 *    (signup creates a Dealer record with same email).
 *  - If found, return listings where dealerId === dealer.id
 */
export const getDealerListings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // find dealer profile by email (dealer record was created at signup with same email)
    const dealer = await prisma.dealer.findFirst({ where: { email: user.email } });
    if (!dealer) return res.status(404).json({ error: 'Dealer profile not found' });

    const listings = await prisma.listing.findMany({
      where: { dealerId: dealer.id },
      include: {
        model: true,
        images: true,
        bookings: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ listings });
  } catch (err) {
    console.error('getDealerListings error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getDealerBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role !== 'dealer') {
      return res.status(403).json({ error: 'Access denied. Only dealers can view their bookings.' });
    }

    const dealer = await prisma.dealer.findFirst({ where: { email: user.email } });
    if (!dealer) return res.status(404).json({ error: 'Dealer profile not found' });

    const bookings = await prisma.booking.findMany({
      where: { dealerId: dealer.id },
      include: {
        listing: {
          include: {
            model: true,
            images: true,
          },
        },
        user: true,
        dealer: true,
      },
      orderBy: { appointmentTs: 'desc' },
      take: 50, // optional: limit results
    });

    const sanitized = bookings.map(b => ({
      id: b.id,
      listing: b.listing ?? null,
      user: b.user ? { id: b.user.id, name: b.user.name, email: b.user.email } : null,
      dealer: b.dealer ? { id: b.dealer.id, name: b.dealer.name, email: b.dealer.email } : null,
      appointmentTs: b.appointmentTs,
      status: b.status,
      createdAt: b.createdAt,
    }));

    return res.json({ bookings: sanitized });
  } catch (err) {
    console.error('getDealerBookings error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
