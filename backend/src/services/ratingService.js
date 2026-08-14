const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { normalizePagination } = require('./userService');

async function assertStoreExists(storeId) {
  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { id: true } });
  if (!store) {
    throw new ApiError(404, 'Store not found.');
  }
  return store;
}

async function submitRating(storeId, userId, rating) {
  await assertStoreExists(storeId);

  const existing = await prisma.rating.findUnique({
    where: { userId_storeId: { userId, storeId } },
  });

  const record = await prisma.rating.upsert({
    where: { userId_storeId: { userId, storeId } },
    update: { rating },
    create: { userId, storeId, rating },
  });

  return { rating: record, created: !existing };
}

async function updateRating(storeId, userId, rating) {
  await assertStoreExists(storeId);

  const existing = await prisma.rating.findUnique({
    where: { userId_storeId: { userId, storeId } },
  });
  if (!existing) {
    throw new ApiError(404, 'Rating not found for this store.');
  }

  const record = await prisma.rating.update({
    where: { id: existing.id },
    data: { rating },
  });
  return { rating: record, created: false };
}

async function getRating(storeId, userId) {
  const record = await prisma.rating.findUnique({
    where: { userId_storeId: { userId, storeId } },
  });
  return record;
}

async function listStoreRatings(storeId, { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' }, opts = {}) {
  if (opts.ownerId) {
    const owned = await prisma.store.findFirst({
      where: { id: storeId, ownerId: opts.ownerId },
      select: { id: true },
    });
    if (!owned) {
      throw new ApiError(403, 'Forbidden: You can only view ratings for your own store.');
    }
  } else {
    await assertStoreExists(storeId);
  }
  const { skip, limit: take } = normalizePagination({ page, limit });

  const orderBy = (() => {
    if (sortBy === 'userName') return { user: { name: order === 'asc' ? 'asc' : 'desc' } };
    if (sortBy === 'userEmail') return { user: { email: order === 'asc' ? 'asc' : 'desc' } };
    if (sortBy === 'rating') return { rating: order === 'asc' ? 'asc' : 'desc' };
    return { createdAt: order === 'asc' ? 'asc' : 'desc' };
  })();

  const [ratings, total] = await Promise.all([
    prisma.rating.findMany({
      where: { storeId },
      orderBy,
      skip,
      take,
      select: {
        id: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true, address: true } },
      },
    }),
    prisma.rating.count({ where: { storeId } }),
  ]);

  return {
    items: ratings,
    total,
    page,
    limit: take,
    totalPages: Math.max(Math.ceil(total / take), 1),
  };
}

module.exports = { submitRating, updateRating, getRating, listStoreRatings, assertStoreExists };