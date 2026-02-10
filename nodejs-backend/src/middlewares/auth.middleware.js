// Auth middleware
import { verifyToken } from '../security/jwt.js';
import { findUserById } from '../repositories/user.repository.js';

// API Middleware (return JSON)
export async function authApiRequired(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  const token = authHeader.slice(7); // clear "Bearer "

  try {
    const payload = verifyToken(token);
    const user = await findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Invalid token' });
    }

    // Send to next handler
    req.user = {
      id: payload.userId,
      login: payload.login,
      ukey: payload.ukey,
    };

    return next();
  } catch (err) {
    console.error('JWT error:', err.message);
    return res.status(401).json({ ok: false, message: 'Invalid token' });
  }
}

// Page middleware (redirect /login)
export async function authPageRequired(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.redirect('/login');
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    const user = await findUserById(payload.userId);
    if (!user) {
      return res.redirect('/login');
    }
    req.user = {
      id: payload.userId,
      login: payload.login,
      ukey: payload.ukey,
    };
    return next();
  } catch {
    return res.redirect('/login');
  }
}
