const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { listStoreRatings } = require('./ratingService');

async function getMyStore(ownerId) {
  const store = await prisma.store.findFirst({
    where: { ownerId },
    select: { id: true, name: true, email: true, address: true, createdAt: true, updatedAt: true },
  });
  return store || null;
}

async function getDashboard(ownerId) {
  const store = await getMyStore(ownerId);
  if (!store) {
    throw new ApiError(404, 'No store is associated with this account yet.');
  }

  const aggregation = await prisma.rating.aggregate({
    where: { storeId: store.id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const breakdownRows = await prisma.rating.groupBy({
    by: ['rating'],
    where: { storeId: store.id },
    _count: { rating: true },
  });

  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  breakdownRows.forEach((r) => {
    ratingBreakdown[r.rating] = r._count.rating;
  });

  const totalRatings = aggregation._count.rating;

  return {
    store,
    averageRating: totalRatings > 0 ? Number(aggregation._avg.rating) : null,
    totalRatings,
    ratingBreakdown,
  };
}

async function listMyStoreRatings(ownerId, query) {
  const store = await getMyStore(ownerId);
  if (!store) {
    throw new ApiError(404, 'No store is associated with this account yet.');
  }
  return listStoreRatings(store.id, query);
}

module.exports = { getDashboard, listMyStoreRatings, getMyStore };