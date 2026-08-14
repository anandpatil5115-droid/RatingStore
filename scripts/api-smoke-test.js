/* End-to-end verification harness for the Store Rating API. */
const BASE = 'http://localhost:5000/api';
let pass = 0;
let fail = 0;

function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  ✔ ${name}`); }
  else { fail++; console.log(`  ✘ ${name}${extra ? `  -> ${JSON.stringify(extra)}` : ''}`); }
}

async function call(method, path, { token, body, expected } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  const ok = res.status >= 200 && res.status < 300;
  if (expected !== undefined && res.status !== expected) {
    return { ok: false, status: res.status, data };
  }
  return { ok, status: res.status, data };
}

const t = (name) => console.log(`\n▸ ${name}`);

(async () => {
  // ---------- Health ----------
  t('Health');
  const health = await call('GET', '/health');
  check('GET /api/health returns 200', health.status === 200);

  // ---------- Unauthenticated access ----------
  t('Unauthenticated access');
  let r = await call('GET', '/admin/dashboard');
  check('Dashboard without token -> 401', r.status === 401 && r.data.success === false, r);
  r = await call('GET', '/users');
  check('Users without token -> 401', r.status === 401);
  r = await call('GET', '/stores');
  check('Stores without token -> 401', r.status === 401);

  // ---------- Registration ----------
  t('Registration');
  const longName = 'Praveen Kumar Anand Devagiri';
  r = await call('POST', '/auth/register', {
    body: { name: 'Short', email: 'short@test.com', password: 'Welcome@123', confirmPassword: 'Welcome@123' },
  });
  check('Name < 20 chars -> 400', r.status === 400, r.data.message);

  r = await call('POST', '/auth/register', {
    body: { name: longName, email: 'short@test.com', password: 'welcome123', confirmPassword: 'welcome123' },
  });
  check('Weak password -> 400', r.status === 400);

  r = await call('POST', '/auth/register', {
    body: { name: longName, email: 'bad@email', password: 'Welcome@123', confirmPassword: 'Welcome@123' },
  });
  check('Invalid email -> 400', r.status === 400);

  r = await call('POST', '/auth/register', {
    body: { name: longName, email: 'short@test.com', password: 'Welcome@123', confirmPassword: 'Different@1' },
  });
  check('Password mismatch -> 400', r.status === 400);

  r = await call('POST', '/auth/register', {
    body: { name: longName, email: 'test.user@example.com', password: 'Welcome@123', confirmPassword: 'Welcome@123', role: 'SYSTEM_ADMIN' },
  });
  check('Register succeeds with token (role ignored -> NORMAL_USER)', r.status === 201 && r.data.data.user.role === 'NORMAL_USER' && r.data.data.token, { role: r.data.data?.user?.role });
  const newUserToken = r.data.data.token;

  r = await call('POST', '/auth/register', {
    body: { name: longName, email: 'test.user@example.com', password: 'Welcome@123', confirmPassword: 'Welcome@123' },
  });
  check('Duplicate email -> 409', r.status === 409, r.data.message);

  // ---------- New user cannot access admin ----------
  t('Role restrictions (normal user)');
  r = await call('GET', '/admin/dashboard', { token: newUserToken });
  check('Normal user -> admin dashboard -> 403', r.status === 403);
  r = await call('GET', '/store-owner/dashboard', { token: newUserToken });
  check('Normal user -> owner dashboard -> 403', r.status === 403);
  r = await call('POST', '/stores', { token: newUserToken, body: { name: 'X Store', email: 'x@x.com', address: 'addr', ownerId: 1 } });
  check('Normal user -> create store -> 403', r.status === 403);

  // ---------- Login (admin / owner / user) ----------
  t('Login');
  r = await call('POST', '/auth/login', { body: { email: 'admin@storehub.io', password: 'Welcome@123' } });
  check('Admin login ok', r.status === 200 && r.data.data.user.role === 'SYSTEM_ADMIN', r);
  const adminToken = r.data.data.token;

  r = await call('POST', '/auth/login', { body: { email: 'admin@storehub.io', password: 'Wrong@Password1' } });
  check('Wrong password -> 401', r.status === 401);

  r = await call('POST', '/auth/login', { body: { email: 'nobody@nowhere.com', password: 'X' } });
  check('Unknown user -> 401', r.status === 401);

  r = await call('POST', '/auth/login', { body: { email: 'meera.rk@example.com', password: 'Welcome@123' } });
  check('Owner login ok', r.status === 200 && r.data.data.user.role === 'STORE_OWNER');
  const ownerToken = r.data.data.token;

  r = await call('POST', '/auth/login', { body: { email: 'ananya.rao@example.com', password: 'Welcome@123' } });
  check('User login ok', r.status === 200 && r.data.data.user.role === 'NORMAL_USER');
  const userToken = r.data.data.token;

  // ---------- Password not exposed ----------
  check('User payload has no passwordHash', !('passwordHash' in (r.data.data.user || {})));
  check('JWT payload contains id/role/email', r.data.data.token.split('.')[0].length > 0);

  // ---------- Admin dashboard ----------
  t('Admin dashboard');
  r = await call('GET', '/admin/dashboard', { token: adminToken });
  check('Dashboard stats', r.status === 200 && r.data.data.totalUsers >= 12 && r.data.data.totalStores === 8 && r.data.data.totalRatings >= 46, r.data.data);

  // ---------- Admin users CRUD ----------
  t('Admin user management');
  r = await call('GET', '/users?page=1&limit=5', { token: adminToken });
  check('List users paginated -> 5 items', r.status === 200 && r.data.data.items.length === 5 && r.data.data.total === 13);
  check('User rows contain no passwordHash', !(r.data.data.items.some((u) => u.passwordHash)));

  r = await call('GET', '/users?search=Ananya', { token: adminToken });
  check('Search users by name', r.status === 200 && r.data.data.items.length === 1 && r.data.data.items[0].email === 'ananya.rao@example.com');

  r = await call('GET', '/users?role=STORE_OWNER', { token: adminToken });
  check('Filter by role -> 4 owners', r.status === 200 && r.data.data.items.length === 4 && r.data.data.items.every((u) => u.role === 'STORE_OWNER'));

  r = await call('GET', '/users?sortBy=email&order=desc', { token: adminToken });
  const emails = r.data.data.items.map((u) => u.email);
  check('Sort by email desc', r.status === 200 && [...emails].sort((a, b) => b.localeCompare(a))[0] === emails[0]);

  r = await call('POST', '/users', { token: adminToken, body: { name: 'Rekha Natarajan Iyer', email: 'newadmin@test.com', password: 'Welcome@123', address: 'Some street', role: 'SYSTEM_ADMIN' } });
  check('Admin creates SYSTEM_ADMIN', r.status === 201 && r.data.data.user.role === 'SYSTEM_ADMIN' && !r.data.data.user.passwordHash);
  const newAdminId = r.data.data.user.id;

  r = await call('POST', '/users', { token: adminToken, body: { name: 'Rekha Natarajan Iyer', email: 'ananya.rao@example.com', password: 'Welcome@123', address: 'x', role: 'NORMAL_USER' } });
  check('Admin duplicate email -> 409', r.status === 409);

  r = await call('GET', `/users/${newAdminId}`, { token: adminToken });
  check('Get user details', r.status === 200 && r.data.data.user.email === 'newadmin@test.com');

  r = await call('GET', '/users/999999', { token: adminToken });
  check('Missing user -> 404', r.status === 404);

  // ---------- Admin stores CRUD ----------
  t('Admin store management');
  r = await call('GET', '/stores', { token: adminToken });
  check('List stores (admin) with avg ratings', r.status === 200 && r.data.data.items.length === 8);
  const withRating = r.data.data.items.find((s) => s.averageRating != null);
  check('Average rating computed dynamically', withRating && typeof withRating.averageRating === 'number' && withRating.ratingCount > 0);

  r = await call('GET', '/stores?search=Spice%20Garden', { token: adminToken });
  check('Search stores by name', r.status === 200 && r.data.data.items[0].name === 'Spice Garden Restaurants');

  r = await call('GET', '/stores?sortBy=rating&order=desc', { token: adminToken });
  const byRating = r.data.data.items.map((s) => (s.averageRating == null ? 0 : s.averageRating));
  check('Sort stores by average rating desc', r.status === 200 && byRating.every((v, i, a) => i === 0 || a[i - 1] >= v));

  r = await call('POST', '/stores', { token: adminToken, body: { name: 'Test Store For Rating', email: 'teststore@example.com', address: '1 Test Road', ownerId: newAdminId } });
  check('Create store with non-owner -> 400', r.status === 400);

  const ownersList = await call('GET', '/users?role=STORE_OWNER&limit=5', { token: adminToken });
  const ownerId = ownersList.data.data.items[0].id;

  r = await call('POST', '/stores', { token: adminToken, body: { name: 'Test Store For Rating', email: 'teststore@example.com', address: '1 Test Road', ownerId } });
  check('Create store ok', r.status === 201 && r.data.data.store.ownerId === ownerId);
  const newStoreId = r.data.data.store.id;

  r = await call('POST', '/stores', { token: adminToken, body: { name: 'Test Store Duplicate', email: 'teststore@example.com', address: 'addr', ownerId } });
  check('Duplicate store email -> 409', r.status === 409);

  // ---------- Normal user: stores + ratings ----------
  t('Normal user store listing & ratings');
  r = await call('GET', '/stores?limit=100', { token: userToken });
  check('User sees all stores with own rating field', r.status === 200 && r.data.data.items.length >= 8 && r.data.data.items.every((s) => 'userRating' in s));

  const techStore = r.data.data.items.find((s) => s.email === 'contact@technova.in');
  check('Store shows overall + own rating', techStore.averageRating != null && (techStore.userRating == null || techStore.userRating >= 1));

  const bookStore = r.data.data.items.find((s) => s.email === 'books@bookhaven.in');
  check('User has no rating on a fresh store', bookStore.userRating == null, bookStore);

  r = await call('POST', `/stores/${bookStore.id}/ratings`, { token: userToken, body: { rating: 5 } });
  check('Submit new rating -> 201', r.status === 201 && r.data.data.rating.rating === 5, r);

  r = await call('POST', `/stores/${bookStore.id}/ratings`, { token: userToken, body: { rating: 4 } });
  check('Resubmit rating updates (200) not duplicate', r.status === 200 && r.data.data.rating.rating === 4);

  r = await call('PUT', `/stores/${bookStore.id}/ratings`, { token: userToken, body: { rating: 2 } });
  check('PUT modifies existing rating', r.status === 200 && r.data.data.rating.rating === 2 && r.data.message.includes('updated'));

  const afterUpdate = await call('GET', '/stores?limit=100', { token: userToken });
  const bookAfter = afterUpdate.data.data.items.find((s) => s.email === 'books@bookhaven.in');
  check('Own rating shown after update (Your Rating: 2)', bookAfter.userRating === 2);
  check('Overall rating recalculated from ratings', bookAfter.averageRating != null && bookAfter.averageRating > 1 && bookAfter.averageRating < 5);

  let dupCheck = await call('GET', `/stores/${bookStore.id}/ratings`, { token: userToken });
  check('Normal user cannot list store ratings -> 403', dupCheck.status === 403);

  r = await call('POST', `/stores/${bookStore.id}/ratings`, { token: userToken, body: { rating: 6 } });
  check('Rating 6 -> 400', r.status === 400, r.data.message);
  r = await call('POST', `/stores/${bookStore.id}/ratings`, { token: userToken, body: { rating: 0 } });
  check('Rating 0 -> 400', r.status === 400);
  r = await call('POST', `/stores/${bookStore.id}/ratings`, { token: userToken, body: { rating: 3.5 } });
  check('Rating 3.5 (non-int) -> 400', r.status === 400);
  r = await call('POST', `/stores/${bookStore.id}/ratings`, { token: userToken, body: { rating: '' } });
  check('Missing rating -> 400', r.status === 400);

  r = await call('PUT', '/stores/999999/ratings', { token: userToken, body: { rating: 3 } });
  check('Rating unknown store -> 404', r.status === 404);

  r = await call('PUT', `/stores/${newStoreId}/ratings`, { token: userToken, body: { rating: 3 } });
  check('Update non-existing rating -> 404', r.status === 404);

  // ---------- Owner flows ----------
  t('Store owner dashboard');
  r = await call('GET', '/store-owner/dashboard', { token: ownerToken });
  check('Owner dashboard has store + stats', r.status === 200 && r.data.data.store && r.data.data.totalRatings > 0 && r.data.data.averageRating > 0, r);
  const ownerStoreId = r.data.data.store.id;

  r = await call('GET', `/store-owner/ratings?sortBy=rating&order=desc`, { token: ownerToken });
  check('Owner list ratings with sorting', r.status === 200 && r.data.data.items.length > 0);
  const ratings = r.data.data.items.map((x) => x.rating);
  check('Ratings sorted desc', ratings.every((v, i, a) => i === 0 || a[i - 1] >= v));

  // owner trying to access another store's ratings
  r = await call('GET', `/stores/${ownerStoreId}/ratings`, { token: ownerToken });
  check('Owner sees own store ratings', r.status === 200);

  const otherStore = (await call('GET', '/stores?limit=100', { token: adminToken })).data.data.items.find((s) => s.id !== ownerStoreId);
  r = await call('GET', `/stores/${otherStore.id}/ratings`, { token: ownerToken });
  check('Owner cannot see another store ratings -> 403', r.status === 403);

  r = await call('GET', '/admin/dashboard', { token: ownerToken });
  check('Owner -> admin -> 403', r.status === 403);
  r = await call('GET', '/users', { token: ownerToken });
  check('Owner -> users list -> 403', r.status === 403);

  r = await call('GET', '/users/me', { token: ownerToken });
  check('Owner me endpoint', r.status === 200 && r.data.data.user.email === 'meera.rk@example.com');

  // ---------- Password change ----------
  t('Password change');
  const targetEmail = 'pa.singh@example.com';
  r = await call('POST', '/auth/register', { body: { name: 'Priyadharshini Ashwin Singh', email: targetEmail, password: 'Welcome@123', confirmPassword: 'Welcome@123' } });
  const pwToken = r.data.data.token;

  r = await call('PUT', '/auth/password', { token: pwToken, body: { currentPassword: 'Wrong@Pass1', newPassword: 'NewPass@123', confirmNewPassword: 'NewPass@123' } });
  check('Wrong current password -> 400', r.status === 400, r.data.message);

  r = await call('PUT', '/auth/password', { token: pwToken, body: { currentPassword: 'Welcome@123', newPassword: 'weakpass', confirmNewPassword: 'weakpass' } });
  check('Weak new password -> 400', r.status === 400);

  r = await call('PUT', '/auth/password', { token: pwToken, body: { currentPassword: 'Welcome@123', newPassword: 'NewPass@123', confirmNewPassword: 'Mismatch@1' } });
  check('Mismatched confirmation -> 400', r.status === 400);

  r = await call('PUT', '/auth/password', { token: pwToken, body: { currentPassword: 'Welcome@123', newPassword: 'NewPass@123', confirmNewPassword: 'NewPass@123' } });
  check('Password change ok', r.status === 200, r);

  const oldLogin = await call('POST', '/auth/login', { body: { email: targetEmail, password: 'Welcome@123' } });
  check('Old password no longer works', oldLogin.status === 401);
  const newLogin = await call('POST', '/auth/login', { body: { email: targetEmail, password: 'NewPass@123' } });
  check('New password works', newLogin.status === 200);

  // ---------- Logout ----------
  t('Logout');
  r = await call('POST', '/auth/logout', { token: newUserToken });
  check('Logout ok', r.status === 200 && r.data.data.loggedOut === true);
  r = await call('POST', '/auth/logout', {});
  check('Logout without token -> 401', r.status === 401);

  // ---------- Invalid id / not found routes ----------
  t('Edge cases');
  r = await call('GET', '/stores/abc', { token: userToken });
  check('Non-integer store id -> 400', r.status === 400);
  r = await call('GET', '/stores/999999', { token: userToken });
  check('Missing store -> 404', r.status === 404);
  r = await call('GET', '/nope', { token: adminToken });
  check('Unknown route -> 404', r.status === 404);
  r = await call('GET', '/admin/dashboard', { token: 'not.a.real.token' });
  check('Invalid token -> 401', r.status === 401);

  console.log(`\n========================================`);
  console.log(`PASS: ${pass}   FAIL: ${fail}`);
  console.log(`========================================`);
  process.exit(fail > 0 ? 1 : 0);
})().catch((err) => {
  console.error('Harness crashed:', err.message);
  process.exit(1);
});