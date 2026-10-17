import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './contracts';

describe('contratos de autenticación', () => {
  it('normaliza el correo de inicio de sesión', () => {
    expect(loginSchema.parse({ email: ' Estudiante@Jala.Test ', password: 'x' }).email).toBe('estudiante@jala.test');
  });

  it('rechaza contraseñas débiles y confirmaciones distintas', () => {
    const result = registerSchema.safeParse({ name: 'Santiago', email: 's@jala.test', password: 'simple', confirmPassword: 'otra' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors).toMatchObject({ password: expect.any(Array), confirmPassword: expect.any(Array) });
  });
});
