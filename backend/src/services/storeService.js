const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const { normalizePagination } = require('./userService');

const SORTABLE_FIELDS = new Set(['name', 'email', 'address', 'rating', 'createdAt']);

function buildStoreWhere({ search, searchFields }) {
  const where = {};
  if (search) {
    where.OR = searchFields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' },
    }));
  }
  return where;
}

function buildStoreOrderBy(sortBy, order) {
  const direction = order === 'asc' ? 'asc' : 'desc';
  if (SORTABLE_FIELDS.has(sortBy)) {
    return { [sortBy]: direction };
  }
  return { createdAt: 'desc' };
}

async function enrichStores(stores, userId) {
  const storeIds = stores.map((s) => s.id);
  if (storeIds.length === 0) {
    return stores;
  }

  const [aggregates, userRatings] = await Promise.all([
    prisma.rating.groupBy({
      by: ['storeId'],
      where: { storeId: { in: storeIds } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    userId
      ? prisma.rating.findMany({
          where: { userId, storeId: { in: storeIds } },
          select: { storeId: true, rating: true },
        })
      : Promise.resolve([]),
  ]);

  const ratingMap = new Map(aggregates.map((a) => [a.storeId, a]));
  const userRatingMap = new Map(userRatings.map((r) => [r.storeId, r.rating]));

  return stores.map((store) => {
    const agg = ratingMap.get(store.id);
    const ratingCount = agg ? agg._count.rating : 0;
    return {
      ...store,
      ratingCount,
      averageRating: agg && ratingCount > 0 ? Number(agg._avg.rating) : null,
      userRating: userRatingMap.has(store.id) ? userRatingMap.get(store.id) : null,
    };
  });
}

async function listStoresByRating({ page, search, searchFields, order, skip, take, userId }) {
  const whereSql = search
    ? Prisma.sql`WHERE (${Prisma.join(searchFields.map((f) => Prisma.sql`"${Prisma.raw(f)}" ILIKE ${`%${search}%`}`), ' OR ')})`
    : Prisma.empty;
  const direction = order === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;

  const rows = await prisma.$queryRaw(Prisma.sql`
    SELECT s.id, s.name, s.email, s.address, s."owner_id" AS "ownerId",
           s.created_at AS "createdAt", s.updated_at AS "updatedAt",
           (SELECT COALESCE(AVG(r.rating), 0) FROM ratings r WHERE r.store_id = s.id) AS "averageRating",
           (SELECT COUNT(*) FROM ratings r WHERE r.store_id = s.id)::int AS "ratingCount"
    FROM stores s
    ${whereSql}
    ORDER BY "averageRating" ${direction}, s.id ASC
    LIMIT ${take} OFFSET ${skip}
  `);

  const countRows = await prisma.$queryRaw(Prisma.sql`
    SELECT COUNT(*)::int AS "total" FROM stores s ${whereSql}
  `);

  let stores = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    address: r.address,
    ownerId: r.ownerId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    ratingCount: r.ratingCount,
    averageRating: r.ratingCount > 0 ? Number(r.averageRating) : null,
    userRating: null,
  }));

  if (userId && stores.length > 0) {
    const userRatings = await prisma.rating.findMany({
      where: { userId, storeId: { in: stores.map((s) => s.id) } },
      select: { storeId: true, rating: true },
    });
    const map = new Map(userRatings.map((x) => [x.storeId, x.rating]));
    stores = stores.map((s) => ({ ...s, userRating: map.has(s.id) ? map.get(s.id) : null }));
  }

  return {
    items: stores,
    total: countRows[0].total,
    page,
    limit: take,
    totalPages: Math.max(Math.ceil(countRows[0].total / take), 1),
  };
}

async function listStores({ page = 1, limit = 10, search, searchFields = ['name', 'address'], sortBy, order, userId }) {
  const { skip, limit: take } = normalizePagination({ page, limit });

  if (sortBy === 'rating') {
    return listStoresByRating({ page, search, searchFields, order, skip, take, userId });
  }

  const where = buildStoreWhere({ search, searchFields });
  const orderBy = buildStoreOrderBy(sortBy, order);

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.store.count({ where }),
  ]);

  const enriched = await enrichStores(stores, userId);
  return {
    items: enriched,
    total,
    page,
    limit: take,
    totalPages: Math.max(Math.ceil(total / take), 1),
  };
}

async function getStoreById(id, userId) {
  const store = await prisma.store.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
      owner: { select: { id: true, name: true, email: true } },
    },
  });
  if (!store) {
    throw new ApiError(404, 'Store not found.');
  }

  const enriched = await enrichStores([store], userId);
  return enriched[0];
}

async function createStore({ name, email, address, ownerId }) {
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner) {
    throw new ApiError(404, 'Owner not found.');
  }
  if (owner.role !== 'STORE_OWNER') {
    throw new ApiError(400, 'The selected owner must be a Store Owner.');
  }

  const existing = await prisma.store.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'A store with this email already exists.');
  }

  const store = await prisma.store.create({
    data: { name, email, address, ownerId },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return store;
}

module.exports = { listStores, getStoreById, createStore, enrichStores };