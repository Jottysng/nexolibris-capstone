import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

type TokenKind = 'access' | 'refresh';
type TokenPayload = { sub: string; email: string; kind: TokenKind; jti: string };

const options = (expiresIn: '15m' | '7d') => ({
  algorithm: 'HS256' as const,
  issuer: config.JWT_ISSUER,
  audience: config.JWT_AUDIENCE,
  expiresIn,
});

export function issueAccessToken(user: { id: string; email: string }) {
  return jwt.sign({ email: user.email, kind: 'access' }, config.JWT_ACCESS_SECRET, {
    ...options('15m'), subject: user.id, jwtid: randomUUID(),
  });
}

export function issueRefreshToken(user: { id: string; email: string }, jti = randomUUID()) {
  return {
    token: jwt.sign({ email: user.email, kind: 'refresh' }, config.JWT_REFRESH_SECRET, {
      ...options('7d'), subject: user.id, jwtid: jti,
    }),
    jti,
  };
}

function verify(token: string, secret: string, kind: TokenKind): TokenPayload {
  const payload = jwt.verify(token, secret, {
    algorithms: ['HS256'], issuer: config.JWT_ISSUER, audience: config.JWT_AUDIENCE,
  }) as jwt.JwtPayload;
  if (payload.kind !== kind || !payload.sub || !payload.jti || typeof payload.email !== 'string') {
    throw new Error('Token inválido');
  }
  return { sub: payload.sub, email: payload.email, kind, jti: payload.jti };
}

export const verifyAccessToken = (token: string) => verify(token, config.JWT_ACCESS_SECRET, 'access');
export const verifyRefreshToken = (token: string) => verify(token, config.JWT_REFRESH_SECRET, 'refresh');
