import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export function createToken(user) {
  const payload = {
    userId: user.id,
    login: user.login,
    ukey: user.ukey,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
