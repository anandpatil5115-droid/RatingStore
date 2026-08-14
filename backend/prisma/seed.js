const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const PASSWORD = 'Welcome@123';

const users = [
  // 1 system administrator (name must meet the 20-character minimum)
  { email: 'admin@storehub.io', name: 'System Administrator', address: '21 MG Road, Bengaluru 560001, Karnataka', role: 'SYSTEM_ADMIN' },
  // Normal users
  { email: 'ananya.rao@example.com', name: 'Ananya Ramanathan Rao', address: '45 Lake View Residency, Indiranagar, Bengaluru 560038, Karnataka', role: 'NORMAL_USER' },
  { email: 'vikram.kulkarni@example.com', name: 'Vikram Ravindra Kulkarni', address: '12 Palm Meadows Layout, Whitefield, Bengaluru 560066, Karnataka', role: 'NORMAL_USER' },
  { email: 'ishita.verma@example.com', name: 'Ishita Meenakshi Verma', address: '78 Green Park Colony, HSR Layout, Bengaluru 560102, Karnataka', role: 'NORMAL_USER' },
  { email: 'karthik.pillai@example.com', name: 'Karthik Sundaram Pillai', address: '56 Orchid Apartments, Koramangala, Bengaluru 560034, Karnataka', role: 'NORMAL_USER' },
  { email: 'divya.narayanan@example.com', name: 'Divya Lakshmi Narayanan', address: '9 Silver Oak Street, Jayanagar, Bengaluru 560041, Karnataka', role: 'NORMAL_USER' },
  { email: 'rohan.sen@example.com', name: 'Rohan Bhattacharyya Sen', address: '33 Sunrise Towers, Marathahalli, Bengaluru 560037, Karnataka', role: 'NORMAL_USER' },
  { email: 'simran.kohli@example.com', name: 'Simranjeet Singh Kohli', address: '14 Blue Nile Residency, BTM Layout, Bengaluru 560029, Karnataka', role: 'NORMAL_USER' },
  // Store owners
  { email: 'meera.rk@example.com', name: 'Meera Krishnamurthy Rao', address: '22 Cedar Heights, Electronic City, Bengaluru 560100, Karnataka', role: 'STORE_OWNER' },
  { email: 'adarsh.desai@example.com', name: 'Adarsh Kulkarni Desai', address: '61 Jasmine Garden, Rajajinagar, Bengaluru 560010, Karnataka', role: 'STORE_OWNER' },
  { email: 'sneha.nair@example.com', name: 'Sneha Venugopal Nair', address: '8 Pearl Court, Malleswaram, Bengaluru 560003, Karnataka', role: 'STORE_OWNER' },
  { email: 'gaurav.patil@example.com', name: 'Gaurav Chandrasekhar Patil', address: '27 Maple Court, Hebbal, Bengaluru 560024, Karnataka', role: 'STORE_OWNER' },
];

const stores = [
  { name: 'TechNova Electronics Hub', email: 'contact@technova.in', address: '101 MG Road, Bengaluru 560001', ownerKey: 'meera.rk@example.com' },
  { name: 'Urban Fresh Grocers', email: 'hello@urbanfresh.in', address: '55 Indiranagar 100ft Road, Bengaluru 560038', ownerKey: 'adarsh.desai@example.com' },
  { name: 'Spice Garden Restaurants', email: 'dine@spicegarden.in', address: '22 Church Street, Bengaluru 560001', ownerKey: 'sneha.nair@example.com' },
  { name: 'BookHaven Library Store', email: 'books@bookhaven.in', address: '14 MG Road, Bengaluru 560001', ownerKey: 'gaurav.patil@example.com' },
  { name: 'StyleCraft Clothing Co', email: 'care@stylecraft.in', address: '180 Commercial Street, Bengaluru 560001', ownerKey: 'meera.rk@example.com' },
  { name: 'GreenLeaf Organic Farms', email: 'shop@greenleaffarms.in', address: '34 HSR Layout Sector 2, Bengaluru 560102', ownerKey: 'adarsh.desai@example.com' },
  { name: 'ByteTech Mobile Zone', email: 'support@bytetechzone.in', address: '9 Koramangala 4th Block, Bengaluru 560034', ownerKey: 'sneha.nair@example.com' },
  { name: 'ComfortMatrix Home Store', email: 'info@comfortmatrix.in', address: '67 Jayanagar 4th Block, Bengaluru 560041', ownerKey: 'gaurav.patil@example.com' },
];

// deterministic pseudo-random ratings across stores
const normalUsers = [1, 2, 3, 4, 5, 6, 7].map((i) => `nu${i}`);
const ratingPool = [5, 4, 4, 5, 3, 5, 4, 2, 5, 4, 3, 4, 5, 5, 4, 1, 5, 4, 4, 5, 3, 4, 5, 2, 5, 4, 3, 5, 4, 5];

function buildRatings(storeId, userIndices, offset) {
  return userIndices.map((idx, i) => ({
    userId: idx,
    storeId,
    rating: ratingPool[(offset + i) % ratingPool.length],
  }));
}

async function main() {
  console.log('[seed] Clearing existing data...');
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  console.log('[seed] Creating users...');
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        passwordHash,
      },
    });
    createdUsers.push(user);
  }

  const normalUserIds = createdUsers.filter((u) => u.role === 'NORMAL_USER').map((u) => u.id);
  const userByEmail = new Map(createdUsers.map((u) => [u.email, u]));

  console.log('[seed] Creating stores...');
  const createdStores = [];
  for (const s of stores) {
    const store = await prisma.store.create({
      data: {
        name: s.name,
        email: s.email,
        address: s.address,
        ownerId: userByEmail.get(s.ownerKey).id,
      },
    });
    createdStores.push({ ...s, id: store.id });
  }

  console.log('[seed] Creating ratings...');
  const ratings = [];
  const roundRobin = (count, startAt) => Array.from({ length: count }, (_, i) => normalUserIds[(startAt + i) % normalUserIds.length]);
  let offset = 0;
  const ratersPerStore = [6, 5, 7, 4, 6, 5, 7, 6];
  createdStores.forEach((store, i) => {
    const userIndices = roundRobin(ratersPerStore[i], i);
    ratings.push(...buildRatings(store.id, userIndices, offset));
    offset += ratersPerStore[i];
  });
  await prisma.rating.createMany({ data: ratings });

  const totals = {
    users: await prisma.user.count(),
    stores: await prisma.store.count(),
    ratings: await prisma.rating.count(),
  };

  // eslint-disable-next-line no-console
  console.log('[seed] Done. Summary:', totals);
  console.log(`[seed] All seeded accounts share the password: ${PASSWORD}`);
}

main()
  .catch((err) => {
    console.error('[seed] Failed:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });