// User repository backed by PostgreSQL via Prisma.
import { prisma } from '../db.js';

/**
 * Find user by "login" (in our API),
 * which is mapped to "email" field in database.
 *
 * @param {string} login - login string from API (treated as email)
 * @returns {Promise<object|null>} Prisma user row or null
 */
export async function findUserByLogin(login) {
  // In DB, we search by email
  const user = await prisma.users.findUnique({
    where: { email: login },
  });

  return user || null;
}

/**
 * Create a new user in database.
 *
 * API passes:
 *   - login        -> mapped to email and display_name
 *   - passwordHash -> mapped to password_hash
 *   - ukey         -> NOT stored in DB (used only in JWT)
 *
 * @param {object} params
 * @param {string} params.login
 * @param {string} params.passwordHash
 * @param {string} params.ukey
 * @returns {Promise<object>} created Prisma user row
 */
export async function saveUser({ login, passwordHash /*, ukey */ }) {
  const user = await prisma.users.create({
    data: {
      email: login,
      display_name: login,
      password_hash: passwordHash,
      avatar_url: null,
      // created_at is defaulted by DB
    },
  });

  return user;
}
