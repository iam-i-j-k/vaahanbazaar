import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // simple helper to find or create by unique-ish fields
  // ...existing code...

  // ======= Extra: create listings + bookings for existing dealer account =======
  // NOTE: this will NOT create user/dealer records — it only creates listings/bookings
  const targetDealerEmail = 'vk0557339@gmail.com';
  const dealerProfile = await prisma.dealer.findFirst({ where: { email: targetDealerEmail } });
  if (!dealerProfile) {
    console.warn(`Dealer with email ${targetDealerEmail} not found — skipping dealer-specific listings/bookings.`);
  } else {
    // pick models that were created above (fallback to first available model)
    const primaryModel = model1 ?? (await prisma.vehicleModel.findFirst());
    const secondaryModel = model2 ?? (await prisma.vehicleModel.findMany({ take: 1 })).then(arr => arr[0]);

    // helper to create listing for this dealer (reuses your existing pattern)
    const findOrCreateListingForDealer = async (props) => {
      const exists = await prisma.listing.findFirst({
        where: {
          modelId: props.modelId,
          dealerId: props.dealerId,
          price: props.price,
        },
      });
      if (exists) return exists;

      const listing = await prisma.listing.create({
        data: {
          modelId: props.modelId,
          dealerId: props.dealerId,
          listingType: props.listingType ?? 'used',
          condition: props.condition ?? 'used',
          year: props.year ?? 2023,
          kms: props.kms ?? 1000,
          price: props.price ?? undefined,
          stockCount: props.stockCount ?? 1,
          createdAt: new Date(),
        },
      });

      if (props.images && props.images.length) {
        await Promise.all(
          props.images.map((url, idx) =>
            prisma.image.create({ data: { listingId: listing.id, url, position: idx } })
          )
        );
      }

      return listing;
    };

    // create two listings for this dealer
    const dealerListingA = await findOrCreateListingForDealer({
      modelId: primaryModel.id,
      dealerId: dealerProfile.id,
      listingType: 'used',
      condition: 'good',
      year: 2021,
      kms: 8000,
      price: 55000,
      stockCount: 1,
      images: ['https://via.placeholder.com/400x300?text=Dealer+Vehicle+A'],
    });

    const dealerListingB = await findOrCreateListingForDealer({
      modelId: secondaryModel.id,
      dealerId: dealerProfile.id,
      listingType: 'used',
      condition: 'excellent',
      year: 2022,
      kms: 1200,
      price: 110000,
      stockCount: 1,
      images: ['https://via.placeholder.com/400x300?text=Dealer+Vehicle+B'],
    });

    // choose an existing buyer (reuses earlier seeded buyer if present)
    const existingBuyer = await prisma.user.findFirst({ where: { role: 'user' } });
    if (!existingBuyer) {
      console.warn('No buyer user found to attach bookings to — skipping creating bookings.');
    } else {
      // create bookings for the dealer's listings (if not already present)
      const b1 = await prisma.booking.findFirst({
        where: { listingId: dealerListingA.id, userId: existingBuyer.id, dealerId: dealerProfile.id },
      });
      if (!b1) {
        await prisma.booking.create({
          data: {
            listingId: dealerListingA.id,
            userId: existingBuyer.id,
            dealerId: dealerProfile.id,
            appointmentTs: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
            status: 'pending',
            createdAt: new Date(),
          },
        });
      }

      const b2 = await prisma.booking.findFirst({
        where: { listingId: dealerListingB.id, userId: existingBuyer.id, dealerId: dealerProfile.id },
      });
      if (!b2) {
        await prisma.booking.create({
          data: {
            listingId: dealerListingB.id,
            userId: existingBuyer.id,
            dealerId: dealerProfile.id,
            appointmentTs: new Date(Date.now() + 1000 * 60 * 60 * 48), // in two days
            status: 'pending',
            createdAt: new Date(),
          },
        });
      }
    }
  }

  // ...existing code...
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
