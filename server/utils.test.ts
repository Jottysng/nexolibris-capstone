import { describe, expect, it } from 'vitest';
import { addDays, addHours, clampPage, cleanWorkId } from './utils';

describe('utilidades del servidor', () => {
  it('normaliza páginas y evita valores fuera de rango', () => {
    expect(clampPage('3')).toBe(3);
    expect(clampPage('0')).toBe(1);
    expect(clampPage('texto')).toBe(1);
    expect(clampPage('999')).toBe(100);
  });

  it('limpia identificadores y calcula vencimientos sin mutar la fecha', () => {
    const date = new Date('2026-10-17T12:00:00.000Z');
    expect(cleanWorkId('/works/OL-123W?')).toBe('OL123W');
    expect(addHours(date, 48).toISOString()).toBe('2026-10-19T12:00:00.000Z');
    expect(addDays(date, 14).toISOString()).toBe('2026-10-31T12:00:00.000Z');
    expect(date.toISOString()).toBe('2026-10-17T12:00:00.000Z');
  });
});
