import jwt from 'jsonwebtoken';

const JWT_ISSUER = 'web-itmo-match';
const JWT_AUDIENCE = 'web-itmo-match';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error('JWT_SECRET is missing or too короткий (мин. 32 символа)');
  }
  return secret;
};

export function createToken(user) {
  const payload = {
    userId: user.id,
    login: user.login,
    ukey: user.ukey,
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '1h',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}
