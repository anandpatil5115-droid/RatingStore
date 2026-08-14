const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function getDashboardStats() {
  const [totalUsers, totalStores, totalRatings, roleCounts, storeCounts] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
    prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
    prisma.rating.groupBy({ by: ['rating'], _count: { rating: true } }),
  ]);

  const roleBreakdown = {
    SYSTEM_ADMIN: 0,
    NORMAL_USER: 0,
    STORE_OWNER: 0,
  };
  roleCounts.forEach((r) => {
    roleBreakdown[r.role] = r._count.role;
  });

  const ratingBreakdown = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  storeCounts.forEach((r) => {
    ratingBreakdown[r.rating] = r._count.rating;
  });

  return { totalUsers, totalStores, totalRatings, roleBreakdown, ratingBreakdown };
}

module.exports = { getDashboardStats };