// src/userStore.js

// Map login -> user
const users = new Map();

// user's fields:
// { id, login, passwordHash, ukey }

export function findUserByLogin(login) {
  return users.get(login) || null;
}

export function saveUser({ login, passwordHash, ukey }) {
  const id = users.size + 1;
  const user = { id, login, passwordHash, ukey };
  users.set(login, user);
  return user;
}
