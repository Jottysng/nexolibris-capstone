import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchForm } from './SearchForm';

describe('SearchForm', () => {
  it('muestra un error cuando la búsqueda está vacía', async () => {
    render(<SearchForm onSearch={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Escribe un título');
  });

  it('envía el término limpio una sola vez', async () => {
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} />);
    await userEvent.type(screen.getByRole('textbox', { name: /buscar por título/i }), '  García Márquez  ');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('García Márquez');
  });
});
