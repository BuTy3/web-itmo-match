// Auth api
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { findUserByLogin, saveUser } from '../repositories/user.repository.js';
import { createToken } from '../security/jwt.js';

const router = Router();

// [POST] /auth/register
router.post('/register', async (req, res) => {
  const { token, login, password } = req.body;

  // Validate login and password
  if (!login || !password) {
    return res.json({
      ok: false,
      message: 'Login and password are required',
    });
  }

  if (password.length < 4) {
    return res.json({
      ok: false,
      message: 'Password must be at least 4 characters',
    });
  }

  const existing = findUserByLogin(login);
  if (existing) {
    return res.json({
      ok: false,
      message: 'Login is already taken',
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Random create ukey
  const ukey = Math.random().toString(36).slice(2);

  // Save user
  const user = saveUser({ login, passwordHash, ukey });

  // Create token and return in response
  const jwtToken = createToken(user);

  return res.json({
    ok: true,
    token: jwtToken,
  });
});

// [POST] /auth/login
router.post('/login', async (req, res) => {
  const { token, login, password } = req.body;

  if (!login || !password) {
    return res.json({
      ok: false,
      message: 'Login and password are required',
    });
  }

  const user = findUserByLogin(login);
  if (!user) {
    return res.json({
      ok: false,
      message: 'Invalid login or password',
    });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.json({
      ok: false,
      message: 'Invalid login or password',
    });
  }

  const jwtToken = createToken(user);

  return res.json({
    ok: true,
    token: jwtToken,
  });
});

export default router;
