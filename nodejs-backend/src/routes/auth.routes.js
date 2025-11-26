// Auth api
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { findUserByLogin, saveUser } from '../repositories/user.repository.js';
import { createToken } from '../security/jwt.js';

const router = Router();

// [POST] /auth/register
router.post('/register', async (req, res) => {
  try {
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

    // Check if user already exists in DB
    const existing = await findUserByLogin(login);
    if (existing) {
      return res.json({
        ok: false,
        message: 'Login is already taken',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // We keep ukey only in JWT payload, not in DB
    const ukey = Math.random().toString(36).slice(2);

    // Save user to DB (email + display_name + password_hash)
    const dbUser = await saveUser({ login, passwordHash });

    // Build user object for JWT (id as number, login as API login, ukey)
    const userForToken = {
      id: Number(dbUser.id),
      login: login,
      ukey,
    };

    // Create token and return in response
    const jwtToken = createToken(userForToken);

    return res.json({
      ok: true,
      token: jwtToken,
    });
  } catch (err) {
    console.error('Error in /auth/register:', err);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error during registration',
    });
  }
});

// [POST] /auth/login
router.post('/login', async (req, res) => {
  try {
    const { token, login, password } = req.body;

    if (!login || !password) {
      return res.json({
        ok: false,
        message: 'Login and password are required',
      });
    }

    // Find user in DB by email (login)
    const dbUser = await findUserByLogin(login);
    if (!dbUser) {
      return res.json({
        ok: false,
        message: 'Invalid login or password',
      });
    }

    // Compare password with stored hash
    const ok = await bcrypt.compare(password, dbUser.password_hash);
    if (!ok) {
      return res.json({
        ok: false,
        message: 'Invalid login or password',
      });
    }

    // Build user object for JWT
    const userForToken = {
      id: Number(dbUser.id),
      login: login, // same as dbUser.email
      // For now we keep a static ukey, not stored in DB
      ukey: 'default-ukey',
    };

    const jwtToken = createToken(userForToken);

    return res.json({
      ok: true,
      token: jwtToken,
    });
  } catch (err) {
    console.error('Error in /auth/login:', err);
    return res.status(500).json({
      ok: false,
      message: 'Internal server error during login',
    });
  }
});

export default router;
