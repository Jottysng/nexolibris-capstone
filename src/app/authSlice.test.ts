import { describe, expect, it } from 'vitest';
import reducer, { sessionCleared, sessionReceived } from './authSlice';

describe('authSlice', () => {
  it('registra y limpia una sesión', () => {
    const session = { user: { id: 'user-1', name: 'Santiago', email: 'demo@nexolibris.test' }, accessToken: 'token' };
    const authenticated = reducer(undefined, sessionReceived(session));
    expect(authenticated).toMatchObject({ status: 'authenticated', accessToken: 'token', user: session.user });
    expect(reducer(authenticated, sessionCleared())).toEqual({ status: 'anonymous', accessToken: null, user: null });
  });
});
