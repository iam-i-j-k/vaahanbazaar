import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ======= Users =======
  const user1 = await prisma.user.create({
    data: {
      name: "Irfan Khan",
      email: "irfan@example.com",
      password: "password123",
      role: "user",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    },
  });

  // ======= Dealers =======
  const dealer1 = await prisma.dealer.create({
    data: {
      name: "Super Bikes Dealer",
      phone: "9999999999",
      email: "dealer1@example.com",
      address: "123 Main St",
      city: "Mumbai",
    },
  });

  // ======= Vehicle Models =======
  const model1 = await prisma.vehicleModel.create({
    data: {
      brand: "Honda",
      modelName: "Activa 6G",
      category: "Scooter",
      fuelType: "Petrol",
      price: 75000,
      mileage: 45,
      engineCC: 109,
      description: "Smooth and reliable scooter",
    },
  });

  const model2 = await prisma.vehicleModel.create({
    data: {
      brand: "TVS",
      modelName: "iQube",
      category: "Scooter",
      fuelType: "Electric",
      price: 120000,
      mileage: 75,
      batteryKwh: 2.25,
      description: "Eco-friendly electric scooter",
    },
  });

  // ======= Listings =======
  const listing1 = await prisma.listing.create({
    data: {
      modelId: model1.id,
      dealerId: dealer1.id,
      listingType: "new",
      condition: "new",
      year: 2025,
      kms: 0,
      price: 72000,
      stockCount: 5,
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      modelId: model2.id,
      dealerId: dealer1.id,
      listingType: "new",
      condition: "new",
      year: 2025,
      kms: 0,
      price: 125000,
      stockCount: 3,
    },
  });

  // ======= Bookings =======
  await prisma.booking.create({
    data: {
      listingId: listing1.id,
      userId: user1.id,
      dealerId: dealer1.id,
      appointmentTs: new Date(),
    },
  });

  // ======= Reviews =======
  await prisma.review.create({
    data: {
      userId: user1.id,
      modelId: model1.id,
      rating: 5,
      comment: "Amazing scooter!",
    },
  });

  // ======= Favorites =======
  await prisma.favorite.create({
    data: {
      userId: user1.id,
      modelId: model2.id,
    },
  });

  // ======= Price Alerts =======
  await prisma.priceAlert.create({
    data: {
      userId: user1.id,
      modelId: model2.id,
      targetPrice: 110000,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
