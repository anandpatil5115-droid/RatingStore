const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const publicUser = require('../utils/publicUser');
const { hashPassword } = require('./authService');

const SORTABLE_FIELDS = new Set(['name', 'email', 'address', 'role', 'createdAt']);

function normalizePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function buildUserWhere({ search, role }) {
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (role) {
    where.role = role;
  }
  return where;
}

function buildUserOrderBy(sortBy, order) {
  if (SORTABLE_FIELDS.has(sortBy)) {
    return { [sortBy]: order === 'asc' ? 'asc' : 'desc' };
  }
  return { createdAt: 'desc' };
}

async function listUsers({ page = 1, limit = 10, search, role, sortBy, order }) {
  const { skip, limit: take } = normalizePagination({ page, limit });
  const where = buildUserWhere({ search, role });
  const orderBy = buildUserOrderBy(sortBy, order);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take,
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true, updatedAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: users,
    total,
    page,
    limit: take,
    totalPages: Math.max(Math.ceil(total / take), 1),
  };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      stores: { select: { id: true, name: true, email: true, address: true } },
      ratings: { select: { id: true, storeId: true, rating: true, createdAt: true } },
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (user.role === 'STORE_OWNER' && user.stores.length > 0) {
    const store = user.stores[0];
    const aggregation = await prisma.rating.aggregate({
      where: { storeId: store.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    store.averageRating = aggregation._avg.rating;
    store.ratingCount = aggregation._count.rating;
  }

  return user;
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      stores: { select: { id: true, name: true, email: true, address: true } },
    },
  });
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  return publicUser(user);
}

async function createUser({ name, email, address, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'Email already exists.');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, address: address || null, role, passwordHash },
  });
  return publicUser(user);
}

module.exports = { listUsers, getUserById, getCurrentUser, createUser, normalizePagination };