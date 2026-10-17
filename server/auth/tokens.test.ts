import { describe, expect, it } from 'vitest';
import { issueAccessToken, issueRefreshToken, verifyAccessToken, verifyRefreshToken } from './tokens';

const user = { id: '7df7af5a-13ea-4bd3-8898-2422e3c30a68', email: 'demo@nexolibris.test' };

describe('tokens de sesión', () => {
  it('emite y valida un access token con su tipo', () => {
    const payload = verifyAccessToken(issueAccessToken(user));
    expect(payload.sub).toBe(user.id);
    expect(payload.kind).toBe('access');
  });

  it('separa los tokens de acceso y renovación', () => {
    const refresh = issueRefreshToken(user);
    expect(verifyRefreshToken(refresh.token).jti).toBe(refresh.jti);
    expect(() => verifyAccessToken(refresh.token)).toThrow();
  });
});
