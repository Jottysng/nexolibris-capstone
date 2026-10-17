import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState, ErrorState, LoadingState } from './States';

describe('estados de interfaz', () => {
  it('anuncia carga, error y ausencia de datos', () => {
    const { rerender } = render(<LoadingState label="Cargando catálogo" />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando catálogo');
    rerender(<ErrorState message="Falló la red" action={<button onClick={vi.fn()}>Reintentar</button>} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falló la red');
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeVisible();
    rerender(<EmptyState title="Sin resultados"><p>Cambia la búsqueda</p></EmptyState>);
    expect(screen.getByRole('status')).toHaveTextContent('Sin resultados');
  });
});
